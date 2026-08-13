import {
  buildUgcSceneStillPrompt,
  buildUgcStillRefUrls,
  generateImage,
  UGC_SCENE_STILL_SYSTEM,
} from '@socialista/ai'
import {
  connectDb,
  disconnectDb,
  getInfluencerById,
  getUgcProjectById,
  updateUgcProject,
  UgcProjectStatus,
  UgcVariantStatus,
  type IUgcProject,
  type IUgcVariant,
} from '@socialista/db'
import { TASK_IDS, type AspectRatio } from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'

import { generateUgcStillsPayloadSchema } from '../../schemas/generate-ugc-stills.schema.js'
import {
  completeGenerationRecord,
  failGenerationRecord,
  GenerationKind,
  GenerationResultType,
  startGenerationRecord,
} from '../shared/generation-record.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { assertSufficientCredits, finalizeGeneration, loadModelAndWorkspace } from '../shared/workspace.js'

function influencerRefs(influencer: {
  coverImageUrl?: string
  galleryImageUrls?: string[]
  identity?: { referenceImageUrls?: string[] }
}): string[] {
  const urls = [
    ...(influencer.identity?.referenceImageUrls ?? []),
    ...(influencer.galleryImageUrls ?? []),
    influencer.coverImageUrl,
  ].filter((url): url is string => Boolean(url))
  return [...new Set(urls)]
}

function selectVariants(project: IUgcProject, variantIds?: string[]): IUgcVariant[] {
  if (variantIds && variantIds.length > 0) {
    const wanted = new Set(variantIds)
    return project.variants.filter(variant => wanted.has(variant.id))
  }
  return project.variants
}

function emptyStills(sceneCount: number) {
  return Array.from({ length: sceneCount }, (_, index) => ({ index }))
}

export const generateUgcStills = schemaTask({
  id: TASK_IDS.generateUgcStills,
  schema: generateUgcStillsPayloadSchema,
  maxDuration: 900,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }) => {
    try {
      await connectDb()
      const project = await getUgcProjectById(payload.projectId)
      if (!project) {
        throw new Error('UGC project not found')
      }

      const variants = selectVariants(project, payload.variantIds)
      if (variants.length === 0) {
        throw new Error('Select at least one creator')
      }

      const { model, workspace } = await loadModelAndWorkspace(project.models.image, payload.workspaceId)
      const stillCount =
        payload.stillIndex === undefined ? project.sceneCount * variants.length : variants.length
      assertSufficientCredits(workspace, model.cost * stillCount)

      await updateUgcProject(payload.projectId, {
        status: UgcProjectStatus.GENERATING,
        stillsRunId: ctx.run.id,
        error: undefined,
      })

      const aspectRatio = (project.aspectRatio === '1:1' ||
      project.aspectRatio === '16:9' ||
      project.aspectRatio === '4:3' ||
      project.aspectRatio === '9:16'
        ? project.aspectRatio
        : '9:16') satisfies AspectRatio

      const nextVariants = project.variants.map(variant => ({ ...variant }))
      let completed = 0
      const total = stillCount

      for (const selected of variants) {
        const variant = nextVariants.find(item => item.id === selected.id)
        if (!variant) continue

        const influencer = await getInfluencerById(variant.influencerId.toString())
        if (!influencer) {
          variant.status = UgcVariantStatus.FAILED
          variant.error = 'Influencer not found'
          continue
        }

        variant.status = UgcVariantStatus.GENERATING
        variant.error = undefined
        if (variant.stills.length !== project.sceneCount) {
          variant.stills = emptyStills(project.sceneCount)
        }

        const startIndex = payload.stillIndex ?? 0
        const endIndex = payload.stillIndex ?? project.sceneCount - 1

        for (let sceneIndex = startIndex; sceneIndex <= endIndex; sceneIndex++) {
          const previousStillUrl =
            sceneIndex > 0 ? variant.stills[sceneIndex - 1]?.imageUrl : undefined
          const imageUrls = buildUgcStillRefUrls({
            influencerReferenceUrls: influencerRefs(influencer),
            productImageUrls: project.productImageUrls,
            previousStillUrl,
            sceneIndex,
          })

          const prompt = [
            UGC_SCENE_STILL_SYSTEM,
            buildUgcSceneStillPrompt({
              sceneIndex,
              sceneCount: project.sceneCount,
              influencerName: influencer.name,
              identityFragment: influencer.identity?.basePromptFragment ?? '',
              productName: project.productName,
              directions: project.directions,
            }),
          ].join('\n\n')

          const triggerRunId = `${ctx.run.id}:${variant.id}:${sceneIndex}`
          const started = await startGenerationRecord({
            kind: GenerationKind.IMAGE,
            taskId: TASK_IDS.generateUgcStills,
            triggerRunId,
            workspaceId: payload.workspaceId,
            userId: payload.userId,
            prompt,
            model,
            inputs: {
              aspectRatio,
              ugcProjectId: payload.projectId,
              ugcVariantId: variant.id,
              ugcShotId: String(sceneIndex),
              productImageUrl: project.productImageUrls[0],
              referenceImageUrl: imageUrls[0],
            },
          })

          setGenerationStatus(
            Math.round((completed / Math.max(total, 1)) * 90),
            `${influencer.name} · scene ${sceneIndex + 1}`,
          )

          try {
            const imageUrl = await generateImage(
              {
                model: model.value,
                provider: model.modelProvider,
                prompt,
                aspectRatio,
                workspaceId: payload.workspaceId,
                userId: payload.userId,
                imageUrl: imageUrls[0],
                imageUrls,
              },
              setGenerationStatus,
            )

            await finalizeGeneration(payload.workspaceId, model)
            await completeGenerationRecord({
              triggerRunId,
              result: { type: GenerationResultType.IMAGE, url: imageUrl },
              cost: model.cost,
              startedAt: started.startedAt,
            })

            const still = variant.stills[sceneIndex] ?? { index: sceneIndex }
            still.index = sceneIndex
            still.imageUrl = imageUrl
            still.generationId = started.generationId
            variant.stills[sceneIndex] = still
            completed += 1
          } catch (error) {
            await failGenerationRecord({
              triggerRunId,
              error,
              startedAt: started.startedAt,
            })
            variant.status = UgcVariantStatus.FAILED
            variant.error = error instanceof Error ? error.message : 'Still generation failed'
            logger.error('UGC still failed', { variantId: variant.id, sceneIndex, error })
            break
          }
        }

        if (variant.status !== UgcVariantStatus.FAILED) {
          const hasAll = variant.stills.every(still => Boolean(still.imageUrl))
          variant.status = hasAll ? UgcVariantStatus.IDLE : UgcVariantStatus.FAILED
        }

        await updateUgcProject(payload.projectId, { variants: nextVariants })
      }

      const failed = nextVariants.some(variant => variant.status === UgcVariantStatus.FAILED)
      await updateUgcProject(payload.projectId, {
        variants: nextVariants,
        status: failed ? UgcProjectStatus.FAILED : UgcProjectStatus.DRAFT,
        error: failed ? 'One or more scenes failed' : undefined,
      })

      setGenerationStatus(100, failed ? 'Finished with errors' : 'Scenes ready')
      return { projectId: payload.projectId }
    } catch (error) {
      setGenerationFailure(error, 'Scene generation failed')
      await updateUgcProject(payload.projectId, {
        status: UgcProjectStatus.FAILED,
        error: error instanceof Error ? error.message : 'Scene generation failed',
      }).catch(() => undefined)
      throw error as Error
    } finally {
      await disconnectDb()
    }
  },
})

export type GenerateUgcStillsTask = typeof generateUgcStills
