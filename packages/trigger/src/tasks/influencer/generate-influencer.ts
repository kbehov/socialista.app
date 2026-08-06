import {
  buildInfluencerAnchorPrompt,
  generateImage,
  INFLUENCER_ANCHOR_SHOTS,
} from '@socialista/ai'
import {
  connectDb,
  disconnectDb,
  getInfluencerById,
  InfluencerStatus,
  updateInfluencer,
} from '@socialista/db'
import { TASK_IDS } from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'

import { generateInfluencerPayloadSchema } from '../../schemas/generate-influencer.schema.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { assertSufficientCredits, finalizeGeneration, loadModelAndWorkspace } from '../shared/workspace.js'

const SHOT_MAX_ATTEMPTS = 2
const SHOT_RETRY_DELAY_MS = 1500

async function generateShotWithRetry(
  generate: () => Promise<string>,
  shotId: string,
): Promise<string> {
  let lastError: unknown
  for (let attempt = 1; attempt <= SHOT_MAX_ATTEMPTS; attempt++) {
    try {
      return await generate()
    } catch (error) {
      lastError = error
      logger.warn('Influencer shot failed', {
        shotId,
        attempt,
        maxAttempts: SHOT_MAX_ATTEMPTS,
        error: error instanceof Error ? error.message : String(error),
      })
      if (attempt < SHOT_MAX_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, SHOT_RETRY_DELAY_MS * attempt))
      }
    }
  }
  throw lastError instanceof Error ? lastError : new Error(`Failed to generate shot: ${shotId}`)
}

export const generateInfluencer = schemaTask({
  id: TASK_IDS.generateInfluencer,
  schema: generateInfluencerPayloadSchema,
  maxDuration: 600,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }) => {
    const galleryImageUrls: string[] = []
    let coverImageUrl: string | undefined

    try {
      await connectDb()

      const influencer = await getInfluencerById(payload.influencerId)
      if (!influencer) {
        throw new Error('Influencer not found')
      }

      await updateInfluencer(payload.influencerId, {
        status: InfluencerStatus.GENERATING,
        error: null,
      })

      const { model, workspace } = await loadModelAndWorkspace(payload.model, payload.workspaceId)
      const shotCount = INFLUENCER_ANCHOR_SHOTS.length
      assertSufficientCredits(workspace, model.cost * shotCount)

      logger.info('Generating influencer anchors', {
        influencerId: payload.influencerId,
        model: model.value,
        shots: shotCount,
      })

      const baseFragment = influencer.identity.basePromptFragment
      const promptCtx = {
        niche: influencer.niche,
        directions: influencer.directions ?? influencer.bio,
      }

      for (let i = 0; i < INFLUENCER_ANCHOR_SHOTS.length; i++) {
        const shot = INFLUENCER_ANCHOR_SHOTS[i]!
        const progress = Math.round(((i + 1) / shotCount) * 90)
        setGenerationStatus(progress, `Generating ${shot.id.replace(/-/g, ' ')}`)

        const prompt = buildInfluencerAnchorPrompt(baseFragment, shot, promptCtx)
        // Portrait-anchor: first shot has no references; later shots use only the cover portrait.
        const imageUrls = coverImageUrl ? [coverImageUrl] : undefined

        const imageUrl = await generateShotWithRetry(
          () =>
            generateImage(
              {
                model: model.value,
                provider: model.modelProvider,
                prompt,
                aspectRatio: shot.aspectRatio,
                workspaceId: payload.workspaceId,
                userId: payload.userId,
                imageUrls,
              },
              setGenerationStatus,
            ),
          shot.id,
        )

        galleryImageUrls.push(imageUrl)
        if (!coverImageUrl) {
          coverImageUrl = imageUrl
        }
        await finalizeGeneration(payload.workspaceId, model)
      }

      const updated = await updateInfluencer(payload.influencerId, {
        status: InfluencerStatus.READY,
        coverImageUrl,
        galleryImageUrls,
        identity: { referenceImageUrls: galleryImageUrls },
        error: null,
      })

      setGenerationStatus(100, 'Complete')
      logger.info('Influencer ready', { influencerId: payload.influencerId, runId: ctx.run.id })

      return {
        influencerId: payload.influencerId,
        coverImageUrl,
        galleryImageUrls,
        status: updated?.status ?? InfluencerStatus.READY,
      }
    } catch (error) {
      setGenerationFailure(error, 'Influencer generation failed')
      // Persist any successful shots so credits spent are not lost.
      await updateInfluencer(payload.influencerId, {
        status: InfluencerStatus.FAILED,
        error: error instanceof Error ? error.message : 'Influencer generation failed',
        ...(galleryImageUrls.length > 0
          ? {
              coverImageUrl: coverImageUrl ?? galleryImageUrls[0],
              galleryImageUrls,
              identity: { referenceImageUrls: galleryImageUrls },
            }
          : {}),
      }).catch(() => undefined)
      throw error as Error
    } finally {
      await disconnectDb()
    }
  },
})
