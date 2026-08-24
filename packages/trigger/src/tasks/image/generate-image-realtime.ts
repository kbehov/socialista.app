import { buildImagePrompt, generateImages } from '@socialista/ai'
import { connectDb, disconnectDb } from '@socialista/db'
import type { ImageGenerationOutput } from '@socialista/types'
import { clampImageGenerationCount, PROMPT_KEYS, TASK_IDS } from '@socialista/types'
import { schemaTask } from '@trigger.dev/sdk/v3'

import { logger } from '@trigger.dev/sdk/v3'
import { imageGenerationPayloadSchema } from '../../schemas/image-generation.schema.js'
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
import { assertSufficientCredits, finalizeGeneration, loadModelAndWorkspace } from '../shared/workspace.js'

function collectReferenceUrls(imageUrl?: string, imageUrls?: string[]): string[] {
  const urls = [...(imageUrls ?? [])]
  if (imageUrl && !urls.includes(imageUrl)) urls.push(imageUrl)
  return urls
}

export const realtimeImageGeneration = schemaTask({
  id: TASK_IDS.imageGeneration,
  schema: imageGenerationPayloadSchema,
  maxDuration: 300,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }): Promise<ImageGenerationOutput> => {
    let startedAt: Date | undefined
    let generationId: string | undefined

    try {
      await connectDb()
      const { model, workspace } = await loadModelAndWorkspace(payload.model, payload.workspaceId)
      const numImages = clampImageGenerationCount(payload.numImages)
      const billedCost = model.cost * numImages
      assertSufficientCredits(workspace, billedCost)
      logger.info('model', { model: model.value, provider: model.modelProvider, numImages })

      const referenceUrls = collectReferenceUrls(payload.imageUrl, payload.imageUrls)

      const started = await startGenerationRecord({
        kind: GenerationKind.IMAGE,
        taskId: TASK_IDS.imageGeneration,
        triggerRunId: ctx.run.id,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        prompt: payload.prompt,
        model,
        inputs: {
          aspectRatio: payload.aspectRatio,
          numImages,
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
          target: PROMPT_KEYS.imagePrompt,
          workspaceId: payload.workspaceId,
        })
        enhanced = await buildImagePrompt({
          prompt: payload.prompt,
          media: referenceUrls.map(imageUrl => ({ imageUrl })),
          aspectRatio: payload.aspectRatio,
          systemOverride,
          targetModel: model.value,
        })
        await setGenerationEnhancedPrompt(ctx.run.id, enhanced)
      }

      const finalPrompt = enhanced

      setGenerationStatus(40, numImages > 1 ? `Generating ${numImages} images` : 'Generating image')

      const generatedImages = await generateImages(
        {
          model: model.value,
          provider: model.modelProvider,
          prompt: finalPrompt,
          aspectRatio: payload.aspectRatio,
          workspaceId: payload.workspaceId,
          userId: payload.userId,
          numImages,
          imageUrl: payload.imageUrl,
          imageUrls: payload.imageUrls,
        },
        setGenerationStatus,
      )
      const imageUrl = generatedImages[0]
      if (!imageUrl) {
        throw new Error('No image was returned from the model')
      }

      await finalizeGeneration(payload.workspaceId, model, billedCost)

      await completeGenerationRecord({
        triggerRunId: ctx.run.id,
        result: {
          type: GenerationResultType.IMAGE,
          url: imageUrl,
          ...(generatedImages.length > 1 ? { urls: generatedImages } : {}),
        },
        cost: billedCost,
        startedAt,
        ...(shouldEnhance ? { enhancedPrompt: enhanced } : {}),
      })

      setGenerationStatus(100, 'Complete')

      if (!generationId) {
        throw new Error('Missing generationId after successful image generation')
      }

      await notifyGenerationComplete({
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        generationId,
        triggerRunId: ctx.run.id,
        kind: 'image',
      })

      return {
        imageUrl,
        imageUrls: generatedImages,
        cost: billedCost,
        generationId,
      }
    } catch (error) {
      setGenerationFailure(error, 'Image generation failed')
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
        kind: 'image',
      })
      throw error as Error
    } finally {
      await disconnectDb()
    }
  },
})

export type RealtimeImageGenerationTask = typeof realtimeImageGeneration
