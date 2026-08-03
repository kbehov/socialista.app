import { buildImagePrompt, generateImage } from '@socialista/ai'
import { connectDb, disconnectDb } from '@socialista/db'
import type { ImageGenerationOutput } from '@socialista/types'
import { ASPECT_RATIOS, TASK_IDS } from '@socialista/types'
import { schemaTask } from '@trigger.dev/sdk/v3'

import { logger } from '@trigger.dev/sdk/v3'
import { z } from 'zod'
import {
  completeGenerationRecord,
  failGenerationRecord,
  GenerationKind,
  GenerationResultType,
  setGenerationEnhancedPrompt,
  startGenerationRecord,
} from '../shared/generation-record.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { assertSufficientCredits, finalizeGeneration, loadModelAndWorkspace } from '../shared/workspace.js'

const taskSchema = z.object({
  model: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  prompt: z.string().min(1),
  aspectRatio: z.enum(ASPECT_RATIOS).default('1:1'),
  imageUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).optional(),
})

export const realtimeImageGeneration = schemaTask({
  id: TASK_IDS.imageGeneration,
  schema: taskSchema,
  maxDuration: 300,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }): Promise<ImageGenerationOutput> => {
    let startedAt: Date | undefined
    let generationId: string | undefined

    try {
      await connectDb()
      // get the model and workspace
      const { model, workspace } = await loadModelAndWorkspace(payload.model, payload.workspaceId)
      // assert sufficient credits
      assertSufficientCredits(workspace, model.cost)
      console.log('model', model)
      logger.info('model', { model: model.value, provider: model.modelProvider })

      // start the generation record
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
          ...(payload.imageUrl ? { referenceImageUrl: payload.imageUrl } : {}),
        },
      })
      startedAt = started.startedAt
      generationId = started.generationId

      setGenerationStatus(10, 'Preparing your prompt')
      console.log('payload', payload)

      const enhanced = await buildImagePrompt({
        prompt: payload.prompt,
        media: payload.imageUrl ? [{ imageUrl: payload.imageUrl }] : undefined,
        aspectRatio: payload.aspectRatio,
      })

      await setGenerationEnhancedPrompt(ctx.run.id, enhanced)
      // Add no watermarks, or ai generated text and labels to the prompt
      const finalPrompt = `${enhanced}\n\n No watermarks, or ai generated text and labels`

      setGenerationStatus(40, 'Generating image')

      const generatedImage = await generateImage(
        {
          model: model.value,
          provider: model.modelProvider,
          prompt: finalPrompt,
          aspectRatio: payload.aspectRatio,
          workspaceId: payload.workspaceId,
          userId: payload.userId,
          imageUrl: payload.imageUrl,
          imageUrls: payload.imageUrls,
        },
        setGenerationStatus,
      )
      await finalizeGeneration(payload.workspaceId, model)

      await completeGenerationRecord({
        triggerRunId: ctx.run.id,
        result: { type: GenerationResultType.IMAGE, url: generatedImage },
        cost: model.cost,
        startedAt,
        enhancedPrompt: enhanced,
      })

      setGenerationStatus(100, 'Complete')

      if (!generationId) {
        throw new Error('Missing generationId after successful image generation')
      }

      return { imageUrl: generatedImage, cost: model.cost, generationId }
    } catch (error) {
      setGenerationFailure(error, 'Image generation failed')
      if (startedAt) {
        await failGenerationRecord({
          triggerRunId: ctx.run.id,
          error,
          startedAt,
        })
      }
      throw error as Error
    } finally {
      await disconnectDb()
    }
  },
})

export type RealtimeImageGenerationTask = typeof realtimeImageGeneration
