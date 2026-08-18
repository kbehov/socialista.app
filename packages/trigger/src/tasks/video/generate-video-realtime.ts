import { buildVideoPrompt, generateVideo } from '@socialista/ai'
import { connectDb, CostUnit, disconnectDb } from '@socialista/db'
import type { VideoGenerationOutput } from '@socialista/types'
import { clampVideoDuration, SKILL_SLOTS, TASK_IDS } from '@socialista/types'
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
import { loadSkillForTask } from '../shared/skills.js'
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
      const duration = clampVideoDuration(payload.duration)
      const generateAudio = payload.generateAudio ?? true
      const billedCost = model.costUnit === CostUnit.PER_SECOND ? model.cost * duration : model.cost
      assertSufficientCredits(workspace, billedCost)
      logger.info('video model', {
        model: model.value,
        provider: model.modelProvider,
        duration,
        generateAudio,
      })

      const referenceUrls = collectReferenceUrls(payload.imageUrl, payload.imageUrls)

      const started = await startGenerationRecord({
        kind: GenerationKind.VIDEO,
        taskId: TASK_IDS.videoGeneration,
        triggerRunId: ctx.run.id,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        prompt: payload.prompt,
        model,
        inputs: {
          aspectRatio: payload.aspectRatio,
          durationSec: duration,
          generateAudio,
          ...(referenceUrls[0] ? { referenceImageUrl: referenceUrls[0] } : {}),
        },
      })
      startedAt = started.startedAt
      generationId = started.generationId

      setGenerationStatus(10, 'Preparing your prompt')

      const skill = await loadSkillForTask({
        skillId: payload.skillId,
        slot: SKILL_SLOTS.videoPromptEnhance,
        workspaceId: payload.workspaceId,
        variables: payload.skillVariables,
      })

      const enhanced = await buildVideoPrompt({
        prompt: payload.prompt,
        media: referenceUrls.map(imageUrl => ({ imageUrl })),
        aspectRatio: payload.aspectRatio,
        durationSec: duration,
        generateAudio,
        systemPrompt: skill.content,
        modelConfig: skill.modelConfig,
      })

      await setGenerationEnhancedPrompt(ctx.run.id, enhanced)
      const finalPrompt = `${enhanced}\n\nNo watermarks, captions, or AI-generated labels.`

      setGenerationStatus(40, 'Generating video')

      const videoUrl = await generateVideo(
        {
          model: model.value,
          provider: model.modelProvider,
          prompt: finalPrompt,
          aspectRatio: payload.aspectRatio,
          workspaceId: payload.workspaceId,
          userId: payload.userId,
          duration,
          generateAudio,
          imageUrl: payload.imageUrl,
          imageUrls: payload.imageUrls,
        },
        setGenerationStatus,
      )

      setGenerationStatus(92, 'Saving to library')

      const videoId = await createGeneratedVideoProject({
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        prompt: payload.prompt,
        videoUrl,
        durationSec: duration,
        aspectRatio: payload.aspectRatio,
      })

      await finalizeGeneration(payload.workspaceId, model, billedCost)

      await completeGenerationRecord({
        triggerRunId: ctx.run.id,
        result: {
          type: GenerationResultType.VIDEO,
          url: videoUrl,
          durationSec: duration,
          videoId,
        },
        cost: billedCost,
        startedAt,
        enhancedPrompt: enhanced,
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
        durationSec: duration,
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
