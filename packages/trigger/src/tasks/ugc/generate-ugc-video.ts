import { generateUgcVideo as generateUgcVideoClip, planUgcVideoPrompt } from '@socialista/ai'
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
import { TASK_IDS } from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'

import { generateUgcVideoPayloadSchema } from '../../schemas/generate-ugc-video.schema.js'
import {
  completeGenerationRecord,
  failGenerationRecord,
  GenerationKind,
  GenerationResultType,
  startGenerationRecord,
} from '../shared/generation-record.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { assertSufficientCredits, finalizeGeneration, loadModel, loadModelAndWorkspace } from '../shared/workspace.js'

function selectVariants(project: IUgcProject, variantIds?: string[]): IUgcVariant[] {
  if (variantIds && variantIds.length > 0) {
    const wanted = new Set(variantIds)
    return project.variants.filter(variant => wanted.has(variant.id))
  }
  return project.variants
}

export const generateUgcVideo = schemaTask({
  id: TASK_IDS.generateUgcVideo,
  schema: generateUgcVideoPayloadSchema,
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
        throw new Error('Select at least one variant')
      }

      const { model, workspace } = await loadModelAndWorkspace(project.models.video, payload.workspaceId)
      assertSufficientCredits(workspace, model.cost * variants.length)

      const plannerValue = project.models.planner ?? project.models.script
      const planner = plannerValue ? await loadModel(plannerValue).catch(() => null) : null

      await updateUgcProject(payload.projectId, {
        status: UgcProjectStatus.GENERATING,
        videoRunId: ctx.run.id,
        error: undefined,
      })

      const nextVariants = project.variants.map(variant => ({ ...variant }))
      let index = 0

      for (const selected of variants) {
        const variant = nextVariants.find(item => item.id === selected.id)
        if (!variant) continue

        const startFrame = variant.stills[0]?.imageUrl
        if (!startFrame) {
          variant.status = UgcVariantStatus.FAILED
          variant.error = 'Generate scenes before video'
          continue
        }

        const influencer = await getInfluencerById(variant.influencerId.toString())
        if (!influencer) {
          variant.status = UgcVariantStatus.FAILED
          variant.error = 'Influencer not found'
          continue
        }

        variant.status = UgcVariantStatus.GENERATING
        variant.error = undefined
        await updateUgcProject(payload.projectId, { variants: nextVariants })

        const stillUrls = variant.stills.flatMap(still => (still.imageUrl ? [still.imageUrl] : []))
        let plannedPrompt = payload.plannedPrompt ?? variant.plannedPrompt
        let negativePrompt = variant.negativePrompt

        if (!payload.skipPlanner && !payload.plannedPrompt && planner) {
          setGenerationStatus(Math.round((index / variants.length) * 40), `Planning ${influencer.name}`)
          try {
            const planned = await planUgcVideoPrompt({
              stillUrls,
              plannerModel: planner.value,
              script: project.script.text,
              directions: project.directions,
              influencerName: influencer.name,
              identityFragment: influencer.identity?.basePromptFragment,
              productName: project.productName,
              aspectRatio: project.aspectRatio,
              sceneCount: stillUrls.length,
              videoModel: model.value,
            })
            plannedPrompt = planned.prompt
            negativePrompt = planned.negativePrompt
            variant.plannedPrompt = planned.prompt
            variant.negativePrompt = planned.negativePrompt
            await finalizeGeneration(payload.workspaceId, planner)
          } catch (error) {
            logger.error('UGC planner failed, using fallback prompt', { error })
            plannedPrompt =
              plannedPrompt ??
              `Photoreal UGC video, same person and product as the start frame. Natural handheld motion. The creator says: ${project.script.text || 'talks about the product'}. ${project.directions ?? ''} No on-screen text, no watermark.`
          }
        }

        if (!plannedPrompt) {
          plannedPrompt = `Photoreal UGC video starting from this frame. Keep the same person, clothes, room, and product. Natural phone-camera motion. Spoken energy: ${project.script.text || 'a short product testimonial'}. ${project.directions ?? ''} No captions or logos.`
          variant.plannedPrompt = plannedPrompt
        }

        const triggerRunId = `${ctx.run.id}:${variant.id}`
        const started = await startGenerationRecord({
          kind: GenerationKind.VIDEO,
          taskId: TASK_IDS.generateUgcVideo,
          triggerRunId,
          workspaceId: payload.workspaceId,
          userId: payload.userId,
          prompt: plannedPrompt,
          model,
          inputs: {
            aspectRatio: project.aspectRatio,
            ugcProjectId: payload.projectId,
            ugcVariantId: variant.id,
            referenceImageUrl: startFrame,
            productImageUrl: project.productImageUrls[0],
          },
        })

        setGenerationStatus(50 + Math.round((index / variants.length) * 40), `Rendering ${influencer.name}`)

        try {
          const videoUrl = await generateUgcVideoClip({
            model: model.value,
            provider: model.modelProvider,
            prompt: plannedPrompt,
            imageUrl: startFrame,
            aspectRatio: project.aspectRatio,
            negativePrompt,
            onProgress: setGenerationStatus,
          })

          await finalizeGeneration(payload.workspaceId, model)
          await completeGenerationRecord({
            triggerRunId,
            result: { type: GenerationResultType.VIDEO, url: videoUrl, thumbnailUrl: startFrame },
            cost: model.cost,
            startedAt: started.startedAt,
            enhancedPrompt: plannedPrompt,
          })

          variant.videoUrl = videoUrl
          variant.thumbnailUrl = startFrame
          variant.generationId = started.generationId
          variant.status = UgcVariantStatus.READY
        } catch (error) {
          await failGenerationRecord({
            triggerRunId,
            error,
            startedAt: started.startedAt,
          })
          variant.status = UgcVariantStatus.FAILED
          variant.error = error instanceof Error ? error.message : 'Video generation failed'
        }

        index += 1
        await updateUgcProject(payload.projectId, { variants: nextVariants })
      }

      const anyReady = nextVariants.some(variant => variant.status === UgcVariantStatus.READY)
      const anyFailed = nextVariants.some(variant => variant.status === UgcVariantStatus.FAILED)
      await updateUgcProject(payload.projectId, {
        variants: nextVariants,
        status: anyReady ? UgcProjectStatus.READY : UgcProjectStatus.FAILED,
        error: anyFailed && !anyReady ? 'Video generation failed' : undefined,
      })

      setGenerationStatus(100, anyReady ? 'Video ready' : 'Video failed')
      return { projectId: payload.projectId }
    } catch (error) {
      setGenerationFailure(error, 'Video generation failed')
      await updateUgcProject(payload.projectId, {
        status: UgcProjectStatus.FAILED,
        error: error instanceof Error ? error.message : 'Video generation failed',
      }).catch(() => undefined)
      throw error as Error
    } finally {
      await disconnectDb()
    }
  },
})

export type GenerateUgcVideoTask = typeof generateUgcVideo
