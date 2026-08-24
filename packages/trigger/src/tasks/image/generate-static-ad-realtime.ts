import { resolvePrompt } from '@socialista/ai'
import { connectDb, disconnectDb } from '@socialista/db'
import type { ImageGenerationOutput } from '@socialista/types'
import { clampImageGenerationCount, PROMPT_KEYS, TASK_IDS } from '@socialista/types'
import { schemaTask } from '@trigger.dev/sdk/v3'
import { generateText } from 'ai'
import {
  buildStaticAdCreativeBrief,
  sanitizeStaticAdModelPrompt,
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
import { notifyGenerationComplete, notifyGenerationFailed } from '../shared/notify.js'
import { loadSkillOverride } from '../shared/skills.js'
import { assertSufficientCredits, finalizeGeneration, loadModelAndWorkspace } from '../shared/workspace.js'

export const realtimeStaticAdGeneration = schemaTask({
  id: TASK_IDS.staticAdGeneration,
  schema: staticAdPayloadSchema,
  maxDuration: 300,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }): Promise<ImageGenerationOutput> => {
    let startedAt: Date | undefined
    let generationId: string | undefined

    try {
      await connectDb()

      const { model, workspace } = await loadModelAndWorkspace(payload.model, payload.workspaceId, {
        modelNotFoundMessage: `Model not found: ${payload.model}. Add openai/gpt-image-2 in the manager before generating static ads.`,
      })
      const numImages = clampImageGenerationCount(payload.numImages)
      const billedCost = model.cost * numImages
      assertSufficientCredits(workspace, billedCost)

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
          numImages,
          ...(payload.adCopy ? { adCopy: payload.adCopy } : {}),
        },
      })
      startedAt = started.startedAt
      generationId = started.generationId

      setGenerationStatus(10, 'Art-directing from product photo')

      const creativeBrief = buildStaticAdCreativeBrief({
        prompt: payload.prompt,
        language: payload.language,
        aspectRatio: payload.aspectRatio,
        adCopy: payload.adCopy,
      })

      const systemOverride = await loadSkillOverride({
        skillId: payload.skillId,
        target: PROMPT_KEYS.staticAd,
        workspaceId: payload.workspaceId,
      })
      const { model: plannerModel, system } = resolvePrompt(PROMPT_KEYS.staticAd, systemOverride)

      const planned = await generateText({
        model: plannerModel,
        system,
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

      const plannedPrompt = sanitizeStaticAdModelPrompt(planned.text)
      console.log('plannedPrompt', plannedPrompt)
      const enhancedPrompt = [
        'Edit Image 1 into a scroll-stopping Meta static ad that does NOT look like a default ChatGPT/Gemini product ad.',
        'Preserve the  product from Image 1. Follow the plan below exactly.',
        '',
        plannedPrompt,
      ].join('\n')
      await setGenerationEnhancedPrompt(ctx.run.id, enhancedPrompt)

      setGenerationStatus(
        30,
        numImages > 1 ? `Rendering ${numImages} campaign creatives` : 'Rendering campaign creative',
      )

      const generateImage = resolveImageGenerator(model.modelProvider)
      const generatedImages = await generateImage({
        model: model.value,
        prompt: enhancedPrompt,
        aspectRatio: payload.aspectRatio,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        imageUrls: [payload.productImage],
        numImages,
        onProgress: setGenerationStatus,
      })
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
        enhancedPrompt,
      })

      setGenerationStatus(100, 'Complete')

      if (!generationId) {
        throw new Error('Missing generationId after successful static ad generation')
      }

      await notifyGenerationComplete({
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        generationId,
        triggerRunId: ctx.run.id,
        kind: 'static-ad',
      })

      return {
        imageUrl,
        imageUrls: generatedImages,
        cost: billedCost,
        generationId,
      }
    } catch (error) {
      setGenerationFailure(error, 'Static ad generation failed')
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
        kind: 'static-ad',
      })
      throw error
    } finally {
      await disconnectDb()
    }
  },
})

export type RealtimeStaticAdGenerationTask = typeof realtimeStaticAdGeneration
