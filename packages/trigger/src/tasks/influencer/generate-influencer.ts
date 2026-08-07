import {
  buildInfluencerAnchorPrompt,
  evaluateAnchorPortrait,
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
import { logger, metadata, schemaTask } from '@trigger.dev/sdk/v3'

import { generateInfluencerPayloadSchema } from '../../schemas/generate-influencer.schema.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { assertSufficientCredits, finalizeGeneration, loadModelAndWorkspace } from '../shared/workspace.js'

const SHOT_MAX_ATTEMPTS = 2
const SHOT_RETRY_DELAY_MS = 1500

async function generateShotWithRetry(
  generate: (attempt: number) => Promise<string>,
  shotId: string,
): Promise<{ imageUrl: string; attempts: number }> {
  let lastError: unknown
  for (let attempt = 1; attempt <= SHOT_MAX_ATTEMPTS; attempt++) {
    try {
      return { imageUrl: await generate(attempt), attempts: attempt }
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
      // Only fal-backed models accept seeds today; vercel/gpt-image ignores them.
      const seedBase = model.modelProvider.toLowerCase().includes('fal')
        ? influencer.identity.seed
        : undefined

      let completedShots = 0
      const reportShotDone = () => {
        completedShots += 1
        setGenerationStatus(
          Math.round(10 + (completedShots / shotCount) * 80),
          `Rendered ${completedShots} of ${shotCount} anchors`,
        )
      }

      const runShot = async (
        shotIndex: number,
        referenceUrls: string[] | undefined,
        seedOffset = 0,
      ): Promise<string> => {
        const shot = INFLUENCER_ANCHOR_SHOTS[shotIndex]!
        let prompt = ''
        const { imageUrl, attempts } = await generateShotWithRetry(async attempt => {
          // On retry: fresh seed and drop free-form scene notes (the most common realism-diluter).
          const ctxForAttempt = attempt > 1 ? { niche: promptCtx.niche } : promptCtx
          prompt = buildInfluencerAnchorPrompt(baseFragment, shot, ctxForAttempt)
          return generateImage(
            {
              model: model.value,
              provider: model.modelProvider,
              prompt,
              aspectRatio: shot.aspectRatio,
              workspaceId: payload.workspaceId,
              userId: payload.userId,
              imageUrls: referenceUrls,
              seed:
                seedBase !== undefined
                  ? seedBase + shotIndex * 1000 + seedOffset * 100 + (attempt - 1)
                  : undefined,
            },
            shotIndex === 0 ? setGenerationStatus : undefined,
          )
        }, shot.id)
        metadata.set(`shot_${shot.id}`, { prompt, imageUrl, attempts })
        await finalizeGeneration(payload.workspaceId, model)
        reportShotDone()
        return imageUrl
      }

      setGenerationStatus(5, 'Generating front portrait')
      coverImageUrl = await runShot(0, undefined)
      galleryImageUrls.push(coverImageUrl)

      // Flag-gated: vision-check the anchor before chaining references off it.
      if (process.env.INFLUENCER_COVER_QUALITY_GATE === 'true') {
        try {
          setGenerationStatus(20, 'Reviewing anchor portrait')
          const quality = await evaluateAnchorPortrait(coverImageUrl)
          metadata.set('shot_front-portrait_quality', quality)
          if (!quality.pass) {
            logger.warn('Anchor portrait failed quality gate, regenerating', {
              influencerId: payload.influencerId,
              reason: quality.reason,
            })
            // Regenerate once without the failed cover as reference, fresh seed.
            coverImageUrl = await runShot(0, undefined, 1)
            galleryImageUrls[0] = coverImageUrl
          }
        } catch (gateError) {
          logger.warn('Anchor quality gate unavailable, continuing', {
            error: gateError instanceof Error ? gateError.message : String(gateError),
          })
        }
      }

      // Remaining shots depend only on the cover portrait — run them in parallel.
      // allSettled keeps successful shots when one fails, so credits spent are not lost.
      const results = await Promise.allSettled(
        INFLUENCER_ANCHOR_SHOTS.slice(1).map((_, i) => runShot(i + 1, [coverImageUrl!])),
      )
      let firstFailure: unknown
      for (const result of results) {
        if (result.status === 'fulfilled') {
          galleryImageUrls.push(result.value)
        } else {
          firstFailure ??= result.reason
        }
      }
      if (firstFailure) {
        throw firstFailure instanceof Error ? firstFailure : new Error('Anchor generation failed')
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
