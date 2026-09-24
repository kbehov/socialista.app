import {
  buildInfluencerImagePrompt,
  generateImage,
  INFLUENCER_SKIN_LOCK_FOOTER,
} from '@socialista/ai'
import {
  appendInfluencerGalleryImage,
  connectDb,
  disconnectDb,
  getInfluencerById,
} from '@socialista/db'
import type { ImageGenerationOutput } from '@socialista/types'
import { clampImageGenerationCount, TASK_IDS } from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'

import { generateInfluencerImagePayloadSchema } from '../../schemas/generate-influencer-image.schema.js'
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
import { assertSufficientCredits, finalizeGeneration, loadModelAndWorkspace } from '../shared/workspace.js'

function influencerOwnsSourceImage(
  influencer: {
    coverImageUrl?: string
    galleryImageUrls?: string[]
    galleryShots?: { url: string }[]
  },
  sourceImageUrl: string,
): boolean {
  if (influencer.coverImageUrl === sourceImageUrl) return true
  if ((influencer.galleryImageUrls ?? []).includes(sourceImageUrl)) return true
  return (influencer.galleryShots ?? []).some(shot => shot.url === sourceImageUrl)
}

export const generateInfluencerImage = schemaTask({
  id: TASK_IDS.generateInfluencerImage,
  schema: generateInfluencerImagePayloadSchema,
  maxDuration: 600,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }): Promise<ImageGenerationOutput> => {
    let startedAt: Date | undefined
    let generationId: string | undefined
    const imageUrls: string[] = []
    let lastEnhanced: string | undefined

    try {
      await connectDb()

      const influencer = await getInfluencerById(payload.influencerId)
      if (!influencer) {
        throw new Error('Influencer not found')
      }
      if (!influencerOwnsSourceImage(influencer, payload.sourceImageUrl)) {
        throw new Error('Source image does not belong to this influencer')
      }

      const count = clampImageGenerationCount(payload.count)
      const { model, workspace } = await loadModelAndWorkspace(payload.model, payload.workspaceId)
      const billedCost = model.cost * count
      assertSufficientCredits(workspace, billedCost)

      const started = await startGenerationRecord({
        kind: GenerationKind.IMAGE,
        taskId: TASK_IDS.generateInfluencerImage,
        triggerRunId: ctx.run.id,
        workspaceId: payload.workspaceId,
        userId: payload.userId,
        projectId: payload.projectId,
        prompt: payload.prompt,
        model,
        inputs: {
          aspectRatio: payload.aspectRatio,
          numImages: count,
          referenceImageUrl: payload.sourceImageUrl,
          influencerId: payload.influencerId,
        },
      })
      startedAt = started.startedAt
      generationId = started.generationId

      const identity = influencer.identity.basePromptFragment.trim()
      const assembled = identity
        ? `${identity}\n\nScene: ${payload.prompt}`
        : payload.prompt

      let lastError: unknown
      for (let index = 0; index < count; index++) {
        const shotLabel = count > 1 ? ` ${index + 1} of ${count}` : ''
        const enhanceProgress = Math.round(8 + (index / count) * 80)
        const generateProgress = Math.round(20 + (index / count) * 80)

        setGenerationStatus(enhanceProgress, `Preparing scene prompt${shotLabel}`)

        let enhanced = assembled
        try {
          enhanced = await buildInfluencerImagePrompt({
            prompt: assembled,
            media: [{ imageUrl: payload.sourceImageUrl }],
            aspectRatio: payload.aspectRatio,
            targetModel: model.value,
            referenceMode: 'cover',
          })
        } catch (enhanceError) {
          logger.warn('Influencer scene prompt enhance failed, using assembled prompt', {
            influencerId: payload.influencerId,
            error: enhanceError instanceof Error ? enhanceError.message : String(enhanceError),
          })
        }
        lastEnhanced = enhanced
        await setGenerationEnhancedPrompt(ctx.run.id, enhanced)

        const prompt = `${enhanced}\n\n${INFLUENCER_SKIN_LOCK_FOOTER}`
        setGenerationStatus(generateProgress, `Generating scene${shotLabel}`)

        try {
          const imageUrl = await generateImage(
            {
              model: model.value,
              provider: model.modelProvider,
              prompt,
              aspectRatio: payload.aspectRatio,
              workspaceId: payload.workspaceId,
              userId: payload.userId,
              imageUrls: [payload.sourceImageUrl],
            },
            setGenerationStatus,
          )

          await appendInfluencerGalleryImage(payload.influencerId, {
            url: imageUrl,
            aspectRatio: payload.aspectRatio,
            shotId: 'scene',
          })

          await finalizeGeneration(payload.workspaceId, model, model.cost)
          imageUrls.push(imageUrl)
        } catch (error) {
          lastError = error
          logger.warn('Influencer scene image failed', {
            influencerId: payload.influencerId,
            index,
            count,
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }

      if (imageUrls.length === 0) {
        throw lastError instanceof Error ? lastError : new Error('Influencer scene generation failed')
      }

      const imageUrl = imageUrls[imageUrls.length - 1]!

      await completeGenerationRecord({
        triggerRunId: ctx.run.id,
        result: {
          type: GenerationResultType.IMAGE,
          url: imageUrl,
          ...(imageUrls.length > 1 ? { urls: imageUrls } : {}),
        },
        cost: model.cost * imageUrls.length,
        startedAt,
        ...(lastEnhanced ? { enhancedPrompt: lastEnhanced } : {}),
      })

      setGenerationStatus(100, 'Complete')

      if (!generationId) {
        throw new Error('Missing generationId after successful influencer scene generation')
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
        imageUrls,
        cost: model.cost * imageUrls.length,
        generationId,
      }
    } catch (error) {
      setGenerationFailure(error, 'Influencer scene generation failed')
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

export type GenerateInfluencerImageTask = typeof generateInfluencerImage
