import { connectDb, disconnectDb } from '@socialista/db'
import { schemaTask } from '@trigger.dev/sdk/v3'
import { generateText } from 'ai'
import { TASK_IDS } from '@socialista/types'
import { generateImagePromptSystemPrompt } from '../../ai/image-prompts.js'
import { resolveImageGenerator } from '../../providers/resolve-provider.js'
import { imageGenerationPayloadSchema } from '../../schemas/image-generation.schema.js'
import type { ImageGenerationOutput } from '@socialista/types'
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
  run: async (payload): Promise<ImageGenerationOutput> => {
    try {
      await connectDb()

      const { model, workspace } = await loadModelAndWorkspace(payload.model, payload.workspaceId)
      assertSufficientCredits(workspace, model.cost)

      setGenerationStatus(10, 'Preparing your prompt')

      const enhanced = await generateText({
        model: 'openai/gpt-5.5',
        system: generateImagePromptSystemPrompt,
        prompt: payload.prompt,
      })

      setGenerationStatus(40, 'Generating image')

      const generateImage = resolveImageGenerator(model.modelProvider)
      const imageUrl = await generateImage({
        model: model.value,
        prompt: enhanced.text,
        aspectRatio: payload.aspectRatio,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        imageUrl: payload.imageUrl,
        onProgress: setGenerationStatus,
      })

      await finalizeGeneration(payload.workspaceId, model)

      setGenerationStatus(100, 'Complete')

      return { imageUrl, cost: model.cost }
    } catch (error) {
      setGenerationFailure(error, 'Image generation failed')
      throw error as Error
    } finally {
      await disconnectDb()
    }
  },
})

export type RealtimeImageGenerationTask = typeof realtimeImageGeneration
