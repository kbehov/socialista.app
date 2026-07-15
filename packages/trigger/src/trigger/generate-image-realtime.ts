import { connectDb, deductAiCredits, disconnectDb, getModelByValue, getWorkspaceById, ModelModel } from '@socialista/db'
import { metadata, schemaTask } from '@trigger.dev/sdk/v3'
import { generateText } from 'ai'
import { z } from 'zod'
import { generateImagePromptSystemPrompt } from '../ai/prompts.js'
import type {
  ImageGenerationError,
  ImageGenerationOutput,
  ImageGenerationStatus,
} from '../types/image-generation.types.js'
import { resolveImageGenerator } from '../utils/common.js'
export const payloadSchema = z.object({
  prompt: z.string().min(1),
  model: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3']).default('1:1'),
  imageUrl: z.string().url().optional(),
})

export type ImageGenerationPayload = z.infer<typeof payloadSchema>

function setStatus(progress: number, label: string) {
  const status: ImageGenerationStatus = { progress, label }
  metadata.set('status', status)
}

function setFailure(error: unknown) {
  const message = error instanceof Error ? error.message : 'Image generation failed'
  setStatus(100, 'Generation failed')
  metadata.set('error', { message } satisfies ImageGenerationError)
}

export const realtimeImageGeneration = schemaTask({
  id: 'realtime-image-generation',
  schema: payloadSchema,
  maxDuration: 300,
  retry: { maxAttempts: 1 },
  run: async (payload): Promise<ImageGenerationOutput> => {
    try {
      await connectDb()

      const model = await getModelByValue(payload.model)
      if (!model) {
        throw new Error(`Model not found: ${payload.model}. Please contact support.`)
      }

      const workspace = await getWorkspaceById(payload.workspaceId)
      if (!workspace) {
        throw new Error('Workspace not found. Please contact support.')
      }

      if (workspace.billing.aiCreditsBalance < model.cost) {
        throw new Error('Insufficient AI credits. Please top up your credits.')
      }

      setStatus(10, 'Preparing your prompt')

      const enhanced = await generateText({
        model: 'openai/gpt-5.5',
        system: generateImagePromptSystemPrompt,
        prompt: payload.prompt,
      })

      setStatus(40, 'Generating image')

      const generateImage = resolveImageGenerator(model.modelProvider)
      const imageUrl = await generateImage({
        model: model.value,
        prompt: enhanced.text,
        aspectRatio: payload.aspectRatio,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        imageUrl: payload.imageUrl,
        onProgress: setStatus,
      })

      await deductAiCredits(payload.workspaceId, model.cost)

      await ModelModel.updateOne({ _id: model._id.toString() }, { $inc: { usageCount: 1 } })

      setStatus(100, 'Complete')

      return { imageUrl, cost: model.cost }
    } catch (error) {
      setFailure(error)
      throw error as Error
    } finally {
      await disconnectDb()
    }
  },
})

export type RealtimeImageGenerationTask = typeof realtimeImageGeneration
