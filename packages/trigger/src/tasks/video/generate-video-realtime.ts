import { buildVideoPrompt, generateVideo } from '@socialista/ai'
import { connectDb, disconnectDb } from '@socialista/db'
import type { VideoGenerationOutput } from '@socialista/types'
import {
  clampVideoDuration,
  isAutoVideoDuration,
  PROMPT_KEYS,
  TASK_IDS,
  VIDEO_DURATION_AUTO,
  VIDEO_DURATION_MAX,
} from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'

import { videoGenerationPayloadSchema } from '../../schemas/video-generation.schema.js'
import { createGeneratedVideoProject } from './create-generated-video-project.js'
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
import { loadSkillOverride } from '../shared/skills.js'
import { probeBilledDurationSec } from '../shared/probe-billed-duration.js'
import { resolveVideoBilledCost, resolveVideoSecondRate } from '../shared/video-cost.js'
import { assertSufficientCredits, finalizeGeneration, loadModelAndWorkspace } from '../shared/workspace.js'

function collectReferenceUrls(imageUrl?: string, imageUrls?: string[]): string[] {
  const urls = [...(imageUrls ?? [])]
  if (imageUrl && !urls.includes(imageUrl)) urls.push(imageUrl)
  return urls
}

export const realtimeVideoGeneration = schemaTask({
  id: TASK_IDS.videoGeneration,
  schema: videoGenerationPayloadSchema,
  maxDuration: 900,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }): Promise<VideoGenerationOutput> => {
    let startedAt: Date | undefined
    let generationId: string | undefined

    try {
      await connectDb()
      const { model, workspace } = await loadModelAndWorkspace(payload.model, payload.workspaceId)
      const isAuto = isAutoVideoDuration(payload.duration)
      const duration = isAuto ? undefined : clampVideoDuration(payload.duration)
      const generateAudio = payload.generateAudio ?? true
      const secondRate = resolveVideoSecondRate(model, payload.resolution)
      const reservedCost = isAuto
        ? secondRate * VIDEO_DURATION_MAX
        : resolveVideoBilledCost(model, payload.resolution, duration!)
      assertSufficientCredits(workspace, reservedCost)
      logger.info('video model', {
        model: model.value,
        provider: model.modelProvider,
        duration: duration ?? VIDEO_DURATION_AUTO,
        generateAudio,
        resolution: payload.resolution,
      })

      const referenceUrls = collectReferenceUrls(payload.imageUrl, payload.imageUrls)

      const started = await startGenerationRecord({
        kind: GenerationKind.VIDEO,
        taskId: TASK_IDS.videoGeneration,
        triggerRunId: ctx.run.id,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        projectId: payload.projectId,
        prompt: payload.prompt,
        model,
        inputs: {
          aspectRatio: payload.aspectRatio,
          ...(duration != null ? { durationSec: duration } : {}),
          generateAudio,
          resolution: payload.resolution,
          ...(referenceUrls[0] ? { referenceImageUrl: referenceUrls[0] } : {}),
        },
      })
      startedAt = started.startedAt
      generationId = started.generationId

      setGenerationStatus(10, 'Preparing your prompt')

      const shouldEnhance = payload.enhance !== false
      let enhanced = payload.prompt
      if (shouldEnhance) {
        const systemOverride = await loadSkillOverride({
          skillId: payload.skillId,
          target: PROMPT_KEYS.videoPrompt,
          workspaceId: payload.workspaceId,
        })
        enhanced = await buildVideoPrompt({
          prompt: payload.prompt,
          media: referenceUrls.map(imageUrl => ({ imageUrl })),
          aspectRatio: payload.aspectRatio,
          ...(duration != null ? { durationSec: duration } : {}),
          generateAudio,
          systemOverride,
          targetModel: model.value,
        })
        await setGenerationEnhancedPrompt(ctx.run.id, enhanced)
      }
      const finalPrompt = enhanced

      setGenerationStatus(40, 'Generating video')

      const videoUrl = await generateVideo(
        {
          model: model.value,
          provider: model.modelProvider,
          prompt: finalPrompt,
          aspectRatio: payload.aspectRatio,
          workspaceId: payload.workspaceId,
          userId: payload.userId,
          duration: isAuto ? VIDEO_DURATION_AUTO : duration,
          generateAudio,
          resolution: payload.resolution,
          imageUrl: payload.imageUrl,
          imageUrls: payload.imageUrls,
        },
        setGenerationStatus,
      )

      const billedDuration = isAuto ? await probeBilledDurationSec(videoUrl) : duration!
      const billedCost = isAuto
        ? secondRate * billedDuration
        : resolveVideoBilledCost(model, payload.resolution, duration!)

      setGenerationStatus(92, 'Saving to library')

      const videoId = await createGeneratedVideoProject({
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        prompt: payload.prompt,
        videoUrl,
        durationSec: billedDuration,
        aspectRatio: payload.aspectRatio,
      })

      await finalizeGeneration(payload.workspaceId, model, billedCost)

      await completeGenerationRecord({
        triggerRunId: ctx.run.id,
        result: {
          type: GenerationResultType.VIDEO,
          url: videoUrl,
          durationSec: billedDuration,
          videoId,
        },
        cost: billedCost,
        startedAt,
        ...(shouldEnhance ? { enhancedPrompt: enhanced } : {}),
      })

      setGenerationStatus(100, 'Complete')

      if (!generationId) {
        throw new Error('Missing generationId after successful video generation')
      }

      await notifyGenerationComplete({
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        generationId,
        triggerRunId: ctx.run.id,
        kind: 'video',
        videoId,
      })

      return {
        videoUrl,
        cost: billedCost,
        generationId,
        durationSec: billedDuration,
        videoId,
      }
    } catch (error) {
      setGenerationFailure(error, 'Video generation failed')
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

export type RealtimeVideoGenerationTask = typeof realtimeVideoGeneration
