import { resolvePrompt } from '@socialista/ai'
import { connectDb, ContextSupport, disconnectDb } from '@socialista/db'
import type { ImageGenerationOutput } from '@socialista/types'
import {
  clampImageGenerationCount,
  PROMPT_KEYS,
  TASK_IDS,
} from '@socialista/types'
import { schemaTask } from '@trigger.dev/sdk/v3'
import { generateText } from 'ai'
import {
  assembleStaticAdImagePrompt,
  buildStaticAdCreativeBrief,
  sanitizeStaticAdModelPrompts,
} from '../../ai/static-ad-prompts.js'
import { resolveImageGenerator } from '../../providers/resolve-provider.js'
import {
  resolveStaticAdImages,
  staticAdPayloadSchema,
} from '../../schemas/static-ad.schema.js'
import {
  completeGenerationRecord,
  failGenerationRecord,
  GenerationKind,
  GenerationResultType,
  setGenerationEnhancedPrompt,
  startGenerationRecord,
} from '../shared/generation-record.js'
import {
  setGenerationFailure,
  setGenerationStatus,
} from '../shared/metadata.js'
import {
  notifyGenerationComplete,
  notifyGenerationFailed,
} from '../shared/notify.js'
import { loadSkillOverride } from '../shared/skills.js'
import {
  assertSufficientCredits,
  finalizeGeneration,
  loadModelAndWorkspace,
} from '../shared/workspace.js'

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

      const { model, workspace } = await loadModelAndWorkspace(
        payload.model,
        payload.workspaceId,
        {
          modelNotFoundMessage: `Model not found: ${payload.model}. Add a text-to-image model with image input support in the manager.`,
        },
      )
      if (!(model.contextSupports ?? []).includes(ContextSupport.IMAGE)) {
        throw new Error(`Model ${payload.model} does not support image inputs.`)
      }
      const numImages = clampImageGenerationCount(payload.numImages)
      assertSufficientCredits(workspace, model.cost * numImages)

      const images = resolveStaticAdImages(payload)
      if (images.length === 0) {
        throw new Error('Add at least one reference image.')
      }
      const productImage =
        images.find((image) => image.role === 'product') ?? images[0]
      const templateImage = images.find((image) => image.role === 'template')
      const hasTemplate = Boolean(templateImage)

      const started = await startGenerationRecord({
        kind: GenerationKind.STATIC_AD,
        taskId: TASK_IDS.staticAdGeneration,
        triggerRunId: ctx.run.id,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        projectId: payload.projectId,
        prompt: payload.prompt,
        model,
        inputs: {
          aspectRatio: payload.aspectRatio,
          ...(productImage ? { productImageUrl: productImage.url } : {}),
          ...(templateImage ? { referenceImageUrl: templateImage.url } : {}),
          imageUrls: images.map((image) => image.url),
          language: payload.language,
          numImages,
          ...(payload.adCopy ? { adCopy: payload.adCopy } : {}),
        },
      })
      startedAt = started.startedAt
      generationId = started.generationId

      setGenerationStatus(
        10,
        hasTemplate
          ? 'Art-directing from template and references'
          : images.length > 1
            ? 'Art-directing from your references'
            : 'Art-directing from your reference',
      )

      const creativeBrief = buildStaticAdCreativeBrief({
        prompt: payload.prompt,
        language: payload.language,
        aspectRatio: payload.aspectRatio,
        adCopy: payload.adCopy,
        images,
        count: numImages,
      })

      const systemOverride = await loadSkillOverride({
        skillId: payload.skillId,
        target: PROMPT_KEYS.staticAd,
        workspaceId: payload.workspaceId,
      })
      const { model: plannerModel, system } = resolvePrompt(
        PROMPT_KEYS.staticAd,
        systemOverride,
      )

      const planned = await generateText({
        model: plannerModel,
        system,
        messages: [
          {
            role: 'user',
            content: [
              ...images.map((image) => ({
                type: 'image' as const,
                image: image.url,
              })),
              { type: 'text', text: creativeBrief },
            ],
          },
        ],
      })

      const plannedPrompts = sanitizeStaticAdModelPrompts(
        planned.text,
        numImages,
      )
      const enhancedPrompts = plannedPrompts.map((prompt) =>
        assembleStaticAdImagePrompt(prompt, images),
      )
      const billedCost = model.cost * enhancedPrompts.length
      const enhancedPrompt = enhancedPrompts.join('\n\n---\n\n')
      await setGenerationEnhancedPrompt(ctx.run.id, enhancedPrompt)

      setGenerationStatus(
        30,
        enhancedPrompts.length > 1
          ? `Rendering ${enhancedPrompts.length} campaign creatives`
          : 'Rendering campaign creative',
      )

      const generateImage = resolveImageGenerator(model.modelProvider)
      const generatedImages = (
        await Promise.all(
          enhancedPrompts.map((prompt) =>
            generateImage({
              model: model.value,
              prompt,
              aspectRatio: payload.aspectRatio,
              workspaceId: payload.workspaceId,
              userId: payload.userId,
              imageUrls: images.map((image) => image.url),
              numImages: 1,
              onProgress: setGenerationStatus,
            }),
          ),
        )
      ).flat()
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
        throw new Error(
          'Missing generationId after successful static ad generation',
        )
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
