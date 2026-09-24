import { buildInfluencerHookVideoPrompt, generateVideo } from '@socialista/ai'
import {
  appendInfluencerHookVideo,
  connectDb,
  CostUnit,
  disconnectDb,
  getInfluencerById,
} from '@socialista/db'
import type { VideoGenerationOutput } from '@socialista/types'
import {
  clampInfluencerHookVideoCount,
  clampVideoDuration,
  INFLUENCER_HOOK_VIDEO_ASPECT_RATIO,
  INFLUENCER_HOOK_VIDEO_RESOLUTION,
  TASK_IDS,
  videoResolutionCostMultiplier,
} from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'

import { generateInfluencerHookVideoPayloadSchema } from '../../schemas/generate-influencer-hook-video.schema.js'
import { createGeneratedVideoProject } from '../video/create-generated-video-project.js'
import {
  completeGenerationRecord,
  failGenerationRecord,
  GenerationKind,
  GenerationResultType,
  setGenerationEnhancedPrompt,
  startGenerationRecord,
} from '../shared/generation-record.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { notifyGenerationComplete, notifyGenerationFailed } from '../shared/notify.js'
import { assertSufficientCredits, finalizeGeneration, loadModelAndWorkspace } from '../shared/workspace.js'

function influencerOwnsSourceImage(
  influencer: {
    coverImageUrl?: string
    galleryImageUrls?: string[]
    galleryShots?: { url: string }[]
  },
  sourceImageUrl: string,
): boolean {
  if (influencer.coverImageUrl === sourceImageUrl) return true
  if ((influencer.galleryImageUrls ?? []).includes(sourceImageUrl)) return true
  return (influencer.galleryShots ?? []).some(shot => shot.url === sourceImageUrl)
}

export const generateInfluencerHookVideo = schemaTask({
  id: TASK_IDS.generateInfluencerHookVideo,
  schema: generateInfluencerHookVideoPayloadSchema,
  maxDuration: 2700,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }): Promise<VideoGenerationOutput> => {
    let startedAt: Date | undefined
    let generationId: string | undefined
    const videoUrls: string[] = []
    let lastVideoId: string | undefined
    let lastEnhanced: string | undefined

    try {
      await connectDb()

      const influencer = await getInfluencerById(payload.influencerId)
      if (!influencer) {
        throw new Error('Influencer not found')
      }
      if (!influencerOwnsSourceImage(influencer, payload.sourceImageUrl)) {
        throw new Error('Source image does not belong to this influencer')
      }

      const duration = clampVideoDuration(payload.duration)
      const count = clampInfluencerHookVideoCount(payload.count)
      const { model, workspace } = await loadModelAndWorkspace(payload.model, payload.workspaceId)
      const billedCost =
        (model.costUnit === CostUnit.PER_SECOND ? model.cost * duration : model.cost) *
        videoResolutionCostMultiplier(INFLUENCER_HOOK_VIDEO_RESOLUTION)
      assertSufficientCredits(workspace, billedCost * count)

      const started = await startGenerationRecord({
        kind: GenerationKind.VIDEO,
        taskId: TASK_IDS.generateInfluencerHookVideo,
        triggerRunId: ctx.run.id,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        projectId: payload.projectId,
        prompt: payload.prompt,
        model,
        inputs: {
          aspectRatio: INFLUENCER_HOOK_VIDEO_ASPECT_RATIO,
          durationSec: duration,
          generateAudio: true,
          resolution: INFLUENCER_HOOK_VIDEO_RESOLUTION,
          numImages: count,
          referenceImageUrl: payload.sourceImageUrl,
          influencerId: payload.influencerId,
          ...(payload.presetId ? { presetId: payload.presetId } : {}),
        },
      })
      startedAt = started.startedAt
      generationId = started.generationId
      const persistedGenerationId = started.generationId

      let lastError: unknown
      for (let index = 0; index < count; index++) {
        const clipLabel = count > 1 ? ` ${index + 1} of ${count}` : ''
        const enhanceProgress = Math.round(8 + (index / count) * 80)
        const generateProgress = Math.round(20 + (index / count) * 80)

        setGenerationStatus(enhanceProgress, `Preparing hook prompt${clipLabel}`)

        const enhanced = await buildInfluencerHookVideoPrompt({
          prompt: payload.prompt,
          media: [{ imageUrl: payload.sourceImageUrl }],
          aspectRatio: INFLUENCER_HOOK_VIDEO_ASPECT_RATIO,
          durationSec: duration,
          generateAudio: true,
          targetModel: model.value,
        })
        lastEnhanced = enhanced
        await setGenerationEnhancedPrompt(ctx.run.id, enhanced)

        setGenerationStatus(generateProgress, `Generating hook video${clipLabel}`)

        try {
          const videoUrl = await generateVideo(
            {
              model: model.value,
              provider: model.modelProvider,
              prompt: enhanced,
              aspectRatio: INFLUENCER_HOOK_VIDEO_ASPECT_RATIO,
              workspaceId: payload.workspaceId,
              userId: payload.userId,
              duration,
              generateAudio: true,
              resolution: INFLUENCER_HOOK_VIDEO_RESOLUTION,
              imageUrl: payload.sourceImageUrl,
            },
            setGenerationStatus,
          )

          const videoId = await createGeneratedVideoProject({
            workspaceId: payload.workspaceId,
            userId: payload.userId,
            prompt: payload.prompt,
            videoUrl,
            durationSec: duration,
            aspectRatio: INFLUENCER_HOOK_VIDEO_ASPECT_RATIO,
          })

          await appendInfluencerHookVideo(payload.influencerId, {
            sourceImageUrl: payload.sourceImageUrl,
            videoUrl,
            videoId,
            generationId: persistedGenerationId,
            prompt: payload.prompt,
            ...(payload.presetId ? { presetId: payload.presetId } : {}),
            model: model.value,
            durationSec: duration,
          })

          await finalizeGeneration(payload.workspaceId, model, billedCost)
          videoUrls.push(videoUrl)
          lastVideoId = videoId
        } catch (error) {
          lastError = error
          logger.warn('Influencer hook video clip failed', {
            influencerId: payload.influencerId,
            index,
            count,
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }

      if (videoUrls.length === 0) {
        throw lastError instanceof Error ? lastError : new Error('Hook video generation failed')
      }

      await completeGenerationRecord({
        triggerRunId: ctx.run.id,
        result: {
          type: GenerationResultType.VIDEO,
          url: videoUrls[videoUrls.length - 1]!,
          urls: videoUrls,
          durationSec: duration,
          videoId: lastVideoId,
        },
        cost: billedCost * videoUrls.length,
        startedAt,
        ...(lastEnhanced ? { enhancedPrompt: lastEnhanced } : {}),
      })

      setGenerationStatus(100, 'Complete')

      if (!generationId) {
        throw new Error('Missing generationId after successful hook video generation')
      }

      await notifyGenerationComplete({
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        generationId,
        triggerRunId: ctx.run.id,
        kind: 'video',
        videoId: lastVideoId,
      })

      return {
        videoUrl: videoUrls[videoUrls.length - 1]!,
        cost: billedCost * videoUrls.length,
        generationId,
        durationSec: duration,
        videoId: lastVideoId,
      }
    } catch (error) {
      setGenerationFailure(error, 'Hook video generation failed')
      if (startedAt) {
        await failGenerationRecord({
          triggerRunId: ctx.run.id,
          error,
          startedAt,
        })
      }
      await notifyGenerationFailed({
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        generationId,
        triggerRunId: ctx.run.id,
        kind: 'video',
      })
      throw error as Error
    } finally {
      await disconnectDb()
    }
  },
})

export type GenerateInfluencerHookVideoTask = typeof generateInfluencerHookVideo
