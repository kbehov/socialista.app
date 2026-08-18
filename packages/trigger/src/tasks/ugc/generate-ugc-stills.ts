import {
  buildImagePrompt,
  buildUgcSceneStillPrompt,
  buildUgcStillRefUrls,
  generateImage,
  UGC_STILL_LOCK_FOOTER,
} from '@socialista/ai'
import {
  connectDb,
  disconnectDb,
  getInfluencerById,
  getUgcProjectById,
  updateUgcClip,
  UgcClipStatus,
  UgcProjectStatus,
  type IUgcClip,
  type IUgcProject,
} from '@socialista/db'
import {
  TASK_IDS,
  ugcClipSceneCount,
  type AspectRatio,
  type UgcClipType,
  SKILL_SLOTS,
} from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'

import { generateUgcStillsPayloadSchema } from '../../schemas/generate-ugc-stills.schema.js'
import {
  completeGenerationRecord,
  failGenerationRecord,
  GenerationKind,
  GenerationResultType,
  setGenerationEnhancedPrompt,
  startGenerationRecord,
} from '../shared/generation-record.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { loadSkillForTask } from '../shared/skills.js'
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

function emptyStills(sceneCount: number): IUgcClip['stills'] {
  return Array.from({ length: sceneCount }, (_, index) => ({ index }))
}

function findClip(project: IUgcProject, clipId: string): IUgcClip | undefined {
  return (project.clips ?? []).find(clip => clip.id === clipId)
}

function resolveInfluencerId(project: IUgcProject, clip: IUgcClip): string | undefined {
  return clip.influencerId?.toString() ?? project.influencerId?.toString()
}

function projectStatusFromClips(clips: IUgcClip[]): UgcProjectStatus {
  if (clips.some(clip => clip.status === UgcClipStatus.GENERATING)) return UgcProjectStatus.GENERATING
  if (clips.some(clip => clip.status === UgcClipStatus.READY)) return UgcProjectStatus.READY
  if (clips.every(clip => clip.status === UgcClipStatus.FAILED) && clips.length > 0) {
    return UgcProjectStatus.FAILED
  }
  return UgcProjectStatus.DRAFT
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

      const clip = findClip(project, payload.clipId)
      if (!clip) {
        throw new Error('Clip not found')
      }

      const clipType = clip.type as UgcClipType
      const sceneCount = ugcClipSceneCount({
        type: clipType,
        stills: clip.stills ?? [],
        sceneCount: clip.sceneCount,
      })
      const startIndex = payload.stillIndex ?? 0
      const endIndex = payload.stillIndex ?? sceneCount - 1
      const stillCount = endIndex - startIndex + 1

      const imageModelValue = clip.models?.image || project.models.image
      const { model, workspace } = await loadModelAndWorkspace(imageModelValue, payload.workspaceId)
      assertSufficientCredits(workspace, model.cost * stillCount)

      const stills: IUgcClip['stills'] =
        clip.stills.length === sceneCount ? [...clip.stills] : emptyStills(sceneCount)

      await updateUgcClip(
        payload.projectId,
        clip.id,
        {
          status: UgcClipStatus.GENERATING,
          error: undefined,
          stillsRunId: ctx.run.id,
          stills,
        },
        {
          status: UgcProjectStatus.GENERATING,
          stillsRunId: ctx.run.id,
          error: undefined,
        },
      )

      const aspectRatio = (project.aspectRatio === '1:1' ||
      project.aspectRatio === '16:9' ||
      project.aspectRatio === '4:3' ||
      project.aspectRatio === '9:16'
        ? project.aspectRatio
        : '9:16') satisfies AspectRatio

      const influencerId = resolveInfluencerId(project, clip)
      const influencer = influencerId ? await getInfluencerById(influencerId) : null

      if (influencerId && !influencer) {
        await updateUgcClip(
          payload.projectId,
          clip.id,
          { status: UgcClipStatus.FAILED, error: 'Influencer not found' },
          { status: UgcProjectStatus.FAILED, error: 'Influencer not found' },
        )
        throw new Error('Influencer not found')
      }

      const skill = await loadSkillForTask({
        skillId: payload.skillId,
        slot: SKILL_SLOTS.imagePromptEnhance,
        workspaceId: payload.workspaceId,
        variables: payload.skillVariables,
      })

      let failed = false
      let completed = 0

      for (let sceneIndex = startIndex; sceneIndex <= endIndex; sceneIndex++) {
        const previousStillUrl = sceneIndex > 0 ? stills[sceneIndex - 1]?.imageUrl : undefined
        const imageUrls = buildUgcStillRefUrls({
          influencerReferenceUrls: influencer ? influencerRefs(influencer) : [],
          productImageUrls: project.productImageUrls,
          extraReferenceUrls: clip.referenceImageUrls,
          previousStillUrl,
          sceneIndex,
        })

        const seed = buildUgcSceneStillPrompt({
          clipType,
          sceneIndex,
          sceneCount,
          influencerName: influencer?.name,
          identityFragment: influencer?.identity?.basePromptFragment,
          productName: project.productName,
          scenePrompt: clip.scenePrompt,
        })

        const triggerRunId = `${ctx.run.id}:${clip.id}:${sceneIndex}`
        const started = await startGenerationRecord({
          kind: GenerationKind.IMAGE,
          taskId: TASK_IDS.generateUgcStills,
          triggerRunId,
          workspaceId: payload.workspaceId,
          userId: payload.userId,
          prompt: seed,
          model,
          inputs: {
            aspectRatio,
            ugcProjectId: payload.projectId,
            ugcClipId: clip.id,
            ugcShotId: String(sceneIndex),
            productImageUrl: project.productImageUrls[0],
            referenceImageUrl: imageUrls[0],
          },
        })

        const existingPrompt = stills[sceneIndex]?.enhancedPrompt
        let enhanced = existingPrompt && payload.skipEnhance ? existingPrompt : seed

        try {
          if (!payload.skipEnhance) {
            setGenerationStatus(
              Math.round((completed / Math.max(stillCount, 1)) * 40),
              'Preparing your prompt',
            )
            const media = imageUrls.slice(0, 4).map(imageUrl => ({ imageUrl }))
            enhanced = await buildImagePrompt({
              prompt: seed,
              media: media.length > 0 ? media : undefined,
              aspectRatio,
              systemPrompt: skill.content,
              modelConfig: skill.modelConfig,
            })
            await setGenerationEnhancedPrompt(triggerRunId, enhanced)
          }

          const finalPrompt = `${enhanced}\n\n${UGC_STILL_LOCK_FOOTER}`

          setGenerationStatus(
            40 + Math.round((completed / Math.max(stillCount, 1)) * 50),
            `Generating scene ${sceneIndex + 1}`,
          )

          const imageUrl = await generateImage(
            {
              model: model.value,
              provider: model.modelProvider,
              prompt: finalPrompt,
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
            enhancedPrompt: enhanced,
          })

          stills[sceneIndex] = {
            index: sceneIndex,
            imageUrl,
            generationId: started.generationId,
            enhancedPrompt: enhanced,
          }
          completed += 1
          await updateUgcClip(payload.projectId, clip.id, { stills })
        } catch (error) {
          await failGenerationRecord({
            triggerRunId,
            error,
            startedAt: started.startedAt,
          })
          failed = true
          logger.error('UGC still failed', { clipId: clip.id, sceneIndex, error })
          break
        }
      }

      const hasAll = stills.every(still => Boolean(still.imageUrl))
      const clipStatus = failed || !hasAll ? UgcClipStatus.FAILED : UgcClipStatus.IDLE
      const latest = await updateUgcClip(payload.projectId, clip.id, {
        stills,
        status: clipStatus,
        error: failed ? 'Scene generation failed' : undefined,
      })

      const clips = (latest?.clips ?? []).map(item =>
        item.id === clip.id ? { ...item, status: clipStatus } : item,
      )
      await updateUgcClip(
        payload.projectId,
        clip.id,
        {},
        {
          status: projectStatusFromClips(clips),
          error: failed ? 'Scene generation failed' : undefined,
        },
      )

      setGenerationStatus(100, failed ? 'Finished with errors' : 'Scenes ready')
      return { projectId: payload.projectId, clipId: clip.id }
    } catch (error) {
      setGenerationFailure(error, 'Scene generation failed')
      const latest = await updateUgcClip(payload.projectId, payload.clipId, {
        status: UgcClipStatus.FAILED,
        error: error instanceof Error ? error.message : 'Scene generation failed',
      }).catch(() => undefined)
      await updateUgcClip(
        payload.projectId,
        payload.clipId,
        {},
        {
          status: projectStatusFromClips(latest?.clips ?? []),
          error: error instanceof Error ? error.message : 'Scene generation failed',
        },
      ).catch(() => undefined)
      throw error as Error
    } finally {
      await disconnectDb()
    }
  },
})

export type GenerateUgcStillsTask = typeof generateUgcStills
