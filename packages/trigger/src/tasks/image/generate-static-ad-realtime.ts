import { connectDb, disconnectDb } from '@socialista/db'
import type { ImageGenerationOutput } from '@socialista/types'
import { TASK_IDS } from '@socialista/types'
import { schemaTask } from '@trigger.dev/sdk/v3'
import { generateText } from 'ai'
import {
  buildStaticAdCreativeBrief,
  sanitizeStaticAdModelPrompt,
  staticAdVisionSystemPrompt,
} from '../../ai/static-ad-prompts.js'
import { resolveImageGenerator } from '../../providers/resolve-provider.js'
import { staticAdPayloadSchema } from '../../schemas/static-ad.schema.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { assertSufficientCredits, finalizeGeneration, loadModelAndWorkspace } from '../shared/workspace.js'

const STATIC_AD_PROMPT_MODEL = 'openai/gpt-5.5'

export const realtimeStaticAdGeneration = schemaTask({
  id: TASK_IDS.staticAdGeneration,
  schema: staticAdPayloadSchema,
  maxDuration: 300,
  retry: { maxAttempts: 1 },
  run: async (payload): Promise<ImageGenerationOutput> => {
    try {
      await connectDb()

      const { model, workspace } = await loadModelAndWorkspace(payload.model, payload.workspaceId, {
        modelNotFoundMessage: `Model not found: ${payload.model}. Add openai/gpt-image-2 in the manager before generating static ads.`,
      })
      assertSufficientCredits(workspace, model.cost)

      setGenerationStatus(10, 'Analyzing product photo')

      const creativeBrief = buildStaticAdCreativeBrief({
        prompt: payload.prompt,
        language: payload.language,
        aspectRatio: payload.aspectRatio,
        adCopy: payload.adCopy,
      })

      const planned = await generateText({
        model: STATIC_AD_PROMPT_MODEL,
        system: staticAdVisionSystemPrompt,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: creativeBrief },
              { type: 'image', image: payload.productImage },
            ],
          },
        ],
      })

      const finalPrompt = sanitizeStaticAdModelPrompt(planned.text)

      setGenerationStatus(30, 'Generating static ad')

      const generateImage = resolveImageGenerator(model.modelProvider)
      const imageUrl = await generateImage({
        model: model.value,
        prompt: finalPrompt,
        aspectRatio: payload.aspectRatio,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        imageUrls: [payload.productImage],
        onProgress: setGenerationStatus,
      })

      await finalizeGeneration(payload.workspaceId, model)

      setGenerationStatus(100, 'Complete')

      return { imageUrl, cost: model.cost }
    } catch (error) {
      setGenerationFailure(error, 'Static ad generation failed')
      throw error
    } finally {
      await disconnectDb()
    }
  },
})

export type RealtimeStaticAdGenerationTask = typeof realtimeStaticAdGeneration
