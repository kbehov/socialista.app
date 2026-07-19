import { connectDb, disconnectDb } from '@socialista/db'
import { schemaTask } from '@trigger.dev/sdk/v3'
import { generateText } from 'ai'
import { TASK_IDS } from '@socialista/types'
import { generateImagePromptSystemPrompt } from '../../ai/image-prompts.js'
import { resolveImageGenerator } from '../../providers/resolve-provider.js'
import { imageGenerationPayloadSchema } from '../../schemas/image-generation.schema.js'
import type { ImageGenerationOutput } from '@socialista/types'
import {
  completeGenerationRecord,
  failGenerationRecord,
  GenerationKind,
  GenerationResultType,
  setGenerationEnhancedPrompt,
  startGenerationRecord,
} from '../shared/generation-record.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import {
  assertSufficientCredits,
  finalizeGeneration,
  loadModelAndWorkspace,
} from '../shared/workspace.js'

export const realtimeImageGeneration = schemaTask({
  id: TASK_IDS.imageGeneration,
  schema: imageGenerationPayloadSchema,
  maxDuration: 300,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }): Promise<ImageGenerationOutput> => {
    let startedAt: Date | undefined

    try {
      await connectDb()

      const { model, workspace } = await loadModelAndWorkspace(payload.model, payload.workspaceId)
      assertSufficientCredits(workspace, model.cost)

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

      setGenerationStatus(10, 'Preparing your prompt')

      const enhanced = await generateText({
        model: 'openai/gpt-5.5',
        system: generateImagePromptSystemPrompt,
        prompt: payload.prompt,
      })
      const enhancedPrompt = enhanced.text
      await setGenerationEnhancedPrompt(ctx.run.id, enhancedPrompt)

      setGenerationStatus(40, 'Generating image')

      const generateImage = resolveImageGenerator(model.modelProvider)
      const imageUrl = await generateImage({
        model: model.value,
        prompt: enhancedPrompt,
        aspectRatio: payload.aspectRatio,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        imageUrl: payload.imageUrl,
        onProgress: setGenerationStatus,
      })

      await finalizeGeneration(payload.workspaceId, model)

      await completeGenerationRecord({
        triggerRunId: ctx.run.id,
        result: { type: GenerationResultType.IMAGE, url: imageUrl },
        cost: model.cost,
        startedAt,
        enhancedPrompt,
      })

      setGenerationStatus(100, 'Complete')

      return { imageUrl, cost: model.cost }
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
