import {
  buildImagePrompt,
  resolvePrompt,
  STATIC_AD_TEMPLATE_EDIT_SYSTEM,
} from '@socialista/ai'
import { connectDb, ContextSupport, disconnectDb, getProductById } from '@socialista/db'
import type { ImageGenerationOutput } from '@socialista/types'
import { clampImageGenerationCount, PROMPT_KEYS, TASK_IDS } from '@socialista/types'
import { schemaTask } from '@trigger.dev/sdk/v3'
import { generateText } from 'ai'
import {
  assembleStaticAdImagePrompt,
  buildStaticAdCreativeBrief,
  buildStaticAdTemplateEditRequest,
  orderStaticAdTemplateEditImages,
  sanitizeStaticAdModelPrompts,
  type StaticAdTemplateProductFact,
} from '../../ai/static-ad-prompts.js'
import type { StaticAdImageInput } from '../../schemas/static-ad.schema.js'
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

const OBJECT_ID = /^[a-f\d]{24}$/i

function compactProductDescription(description: string): string {
  return description.replace(/\s+/g, ' ').trim().slice(0, 500)
}

async function loadTemplateProductFacts(
  images: readonly StaticAdImageInput[],
  workspaceId: string,
): Promise<StaticAdTemplateProductFact[]> {
  const seenProductIds = new Set<string>()
  const facts = await Promise.all(
    images.map(async (image, index): Promise<StaticAdTemplateProductFact | null> => {
      if (image.role !== 'product') return null
      const imageName = `Image ${index + 1}`
      const productId = image.productId?.trim()
      if (productId && seenProductIds.has(productId)) return null
      if (productId) seenProductIds.add(productId)
      if (productId && OBJECT_ID.test(productId)) {
        try {
          const product = await getProductById(productId)
          if (product && String(product.workspaceId) === workspaceId) {
            const description = compactProductDescription(product.description ?? '')
            return {
              image: imageName,
              name: product.name.trim(),
              ...(description ? { description } : {}),
            }
          }
        } catch {
          // A bad catalog id should not block the edit. The photo still applies.
        }
      }
      const label = image.label?.trim()
      return label ? { image: imageName, name: label } : null
    }),
  )
  return facts.filter((fact): fact is StaticAdTemplateProductFact => fact !== null)
}
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
          ...(payload.templateId ? { templateId: payload.templateId } : {}),
          ...(payload.adCopy ? { adCopy: payload.adCopy } : {}),
        },
      })
      startedAt = started.startedAt
      generationId = started.generationId

      const generateImage = resolveImageGenerator(model.modelProvider)
      const imageUrls = images.map((image) => image.url)
      let enhancedPrompt: string
      let generatedImages: string[]
      let billedCost: number

      if (hasTemplate) {
        setGenerationStatus(10, 'Preparing your prompt')
        const editImages = orderStaticAdTemplateEditImages(images)
        const editImageUrls = editImages.map((image) => image.url)
        const products = await loadTemplateProductFacts(editImages, payload.workspaceId)
        const editRequest = buildStaticAdTemplateEditRequest({
          prompt: payload.prompt,
          language: payload.language,
          adCopy: payload.adCopy,
          images,
          products,
        })
        enhancedPrompt = await buildImagePrompt({
          prompt: editRequest,
          media: editImageUrls.map((imageUrl) => ({ imageUrl })),
          aspectRatio: payload.aspectRatio,
          systemOverride: STATIC_AD_TEMPLATE_EDIT_SYSTEM,
          targetModel: model.value,
        })
        billedCost = model.cost * numImages
        await setGenerationEnhancedPrompt(ctx.run.id, enhancedPrompt)
        setGenerationStatus(
          40,
          numImages > 1 ? `Generating ${numImages} images` : 'Generating image',
        )
        generatedImages = await generateImage({
          model: model.value,
          prompt: enhancedPrompt,
          aspectRatio: payload.aspectRatio,
          workspaceId: payload.workspaceId,
          userId: payload.userId,
          imageUrls: editImageUrls,
          numImages,
          onProgress: setGenerationStatus,
        })
      } else {
        setGenerationStatus(
          10,
          images.length > 1
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

        const enhancedPrompts = sanitizeStaticAdModelPrompts(
          planned.text,
          numImages,
        ).map((prompt) => assembleStaticAdImagePrompt(prompt, images))
        enhancedPrompt = enhancedPrompts.join('\n\n---\n\n')
        billedCost = model.cost * enhancedPrompts.length
        await setGenerationEnhancedPrompt(ctx.run.id, enhancedPrompt)

        setGenerationStatus(
          30,
          enhancedPrompts.length > 1
            ? `Rendering ${enhancedPrompts.length} campaign creatives`
            : 'Rendering campaign creative',
        )

        generatedImages = (
          await Promise.all(
            enhancedPrompts.map((prompt) =>
              generateImage({
                model: model.value,
                prompt,
                aspectRatio: payload.aspectRatio,
                workspaceId: payload.workspaceId,
                userId: payload.userId,
                imageUrls,
                numImages: 1,
                onProgress: setGenerationStatus,
              }),
            ),
          )
        ).flat()
      }
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
