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

const STATIC_AD_PROMPT_MODEL = 'openai/gpt-5.5'

export const realtimeStaticAdGeneration = schemaTask({
  id: TASK_IDS.staticAdGeneration,
  schema: staticAdPayloadSchema,
  maxDuration: 300,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }): Promise<ImageGenerationOutput> => {
    let startedAt: Date | undefined

    try {
      await connectDb()

      const { model, workspace } = await loadModelAndWorkspace(payload.model, payload.workspaceId, {
        modelNotFoundMessage: `Model not found: ${payload.model}. Add openai/gpt-image-2 in the manager before generating static ads.`,
      })
      assertSufficientCredits(workspace, model.cost)

      const started = await startGenerationRecord({
        kind: GenerationKind.STATIC_AD,
        taskId: TASK_IDS.staticAdGeneration,
        triggerRunId: ctx.run.id,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        prompt: payload.prompt,
        model,
        inputs: {
          aspectRatio: payload.aspectRatio,
          productImageUrl: payload.productImage,
          language: payload.language,
          ...(payload.adCopy ? { adCopy: payload.adCopy } : {}),
        },
      })
      startedAt = started.startedAt

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

      const enhancedPrompt = sanitizeStaticAdModelPrompt(planned.text)
      await setGenerationEnhancedPrompt(ctx.run.id, enhancedPrompt)

      setGenerationStatus(30, 'Generating static ad')

      const generateImage = resolveImageGenerator(model.modelProvider)
      const imageUrl = await generateImage({
        model: model.value,
        prompt: enhancedPrompt,
        aspectRatio: payload.aspectRatio,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        imageUrls: [payload.productImage],
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
      setGenerationFailure(error, 'Static ad generation failed')
      if (startedAt) {
        await failGenerationRecord({
          triggerRunId: ctx.run.id,
          error,
          startedAt,
        })
      }
      throw error
    } finally {
      await disconnectDb()
    }
  },
})

export type RealtimeStaticAdGenerationTask = typeof realtimeStaticAdGeneration
