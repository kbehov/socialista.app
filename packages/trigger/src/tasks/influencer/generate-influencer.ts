import {
  buildInfluencerAnchorPrompt,
  buildInfluencerBasePromptFragment,
  buildInfluencerCharacterSheet,
  evaluateAnchorPortrait,
  generateImage,
  getInfluencerShotsForPack,
  type InfluencerShot,
} from '@socialista/ai'
import {
  connectDb,
  disconnectDb,
  getInfluencerById,
  InfluencerShotPack as DbInfluencerShotPack,
  InfluencerStatus,
  updateInfluencer,
} from '@socialista/db'
import {
  INFLUENCER_SHOT_PACK_SPEC,
  TASK_IDS,
  type InfluencerGalleryShot,
  type InfluencerShotPack,
} from '@socialista/types'
import { logger, metadata, schemaTask } from '@trigger.dev/sdk/v3'

import { generateInfluencerPayloadSchema } from '../../schemas/generate-influencer.schema.js'
import { setGenerationFailure, setGenerationStatus } from '../shared/metadata.js'
import { assertSufficientCredits, finalizeGeneration, loadModelAndWorkspace } from '../shared/workspace.js'

const SHOT_MAX_ATTEMPTS = 2
const SHOT_RETRY_DELAY_MS = 1500
/** Cover QA on by default; set INFLUENCER_COVER_QUALITY_GATE=false to skip. */
const COVER_QUALITY_GATE_ENABLED = process.env.INFLUENCER_COVER_QUALITY_GATE !== 'false'

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

/**
 * Balanced influencer generation:
 * 1) Character sheet once → locked identity
 * 2) One cover (+ optional QA retry)
 * 3) Remaining pack shots in parallel, cover as sole reference
 * Prompt = fixed identity + platform shot suffix + niche vibe scene (no LLM per image).
 */
export const generateInfluencer = schemaTask({
  id: TASK_IDS.generateInfluencer,
  schema: generateInfluencerPayloadSchema,
  maxDuration: 600,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }) => {
    const galleryShots: InfluencerGalleryShot[] = []
    let coverImageUrl: string | undefined

    try {
      await connectDb()

      const influencer = await getInfluencerById(payload.influencerId)
      if (!influencer) {
        throw new Error('Influencer not found')
      }

      const shotPack: InfluencerShotPack =
        payload.shotPack ?? (influencer.identity.shotPack as InfluencerShotPack | undefined) ?? 'quick'
      const dbShotPack = shotPack as unknown as DbInfluencerShotPack
      const packSpec = INFLUENCER_SHOT_PACK_SPEC[shotPack]
      const shots = getInfluencerShotsForPack(shotPack)
      const shotCount = shots.length

      await updateInfluencer(payload.influencerId, {
        status: InfluencerStatus.GENERATING,
        error: null,
        identity: { shotPack: dbShotPack },
      })

      const { model, workspace } = await loadModelAndWorkspace(payload.model, payload.workspaceId)
      assertSufficientCredits(workspace, model.cost * packSpec.billed)

      // ── Step 0: character sheet (once) ───────────────────────────────────
      setGenerationStatus(5, 'Building character sheet')
      let characterSheet = influencer.identity.characterSheet
      let baseFragment = influencer.identity.basePromptFragment
      const userReferenceImageUrls = (influencer.identity.userReferenceImageUrls ?? [])
        .map(url => url.trim())
        .filter(Boolean)
        .slice(0, 3)

      try {
        characterSheet = await buildInfluencerCharacterSheet({
          name: influencer.name,
          gender: influencer.gender,
          ageRange: influencer.ageRange,
          ethnicity: influencer.ethnicity,
          appearance: influencer.appearance,
          niche: influencer.niche,
          scenes: influencer.scenes,
          aestheticTags: influencer.aestheticTags,
          directions: influencer.directions,
          bio: influencer.bio,
          photoStyle: influencer.photoStyle,
          ...(userReferenceImageUrls.length > 0
            ? { referenceImageUrls: userReferenceImageUrls }
            : {}),
        })
        baseFragment = buildInfluencerBasePromptFragment({
          name: influencer.name,
          gender: influencer.gender,
          ageRange: influencer.ageRange,
          ethnicity: influencer.ethnicity,
          appearance: influencer.appearance,
          characterSheet,
          preferReferenceAppearance: userReferenceImageUrls.length > 0,
        })
        await updateInfluencer(payload.influencerId, {
          identity: {
            characterSheet,
            basePromptFragment: baseFragment,
            shotPack: dbShotPack,
          },
        })
        metadata.set('character_sheet', {
          ...characterSheet,
          wardrobe: { ...characterSheet.wardrobe },
        })
      } catch (sheetError) {
        logger.warn('Character sheet unavailable, using deterministic fragment', {
          error: sheetError instanceof Error ? sheetError.message : String(sheetError),
        })
      }

      logger.info('Generating influencer pack', {
        influencerId: payload.influencerId,
        model: model.value,
        shotPack,
        shots: shotCount,
        userReferenceCount: userReferenceImageUrls.length,
      })

      const promptCtxBase = {
        niche: influencer.niche,
        scenes: influencer.scenes,
        accessories: influencer.appearance.accessories,
        aestheticTags: influencer.aestheticTags,
        characterSheet,
        photoStyle: influencer.photoStyle,
        directions: influencer.directions,
        ...(userReferenceImageUrls.length > 0
          ? { userReferenceCount: userReferenceImageUrls.length }
          : {}),
      }

      const seedBase = model.modelProvider.toLowerCase().includes('fal')
        ? influencer.identity.seed
        : undefined

      let completedShots = 0
      const reportShotDone = (label: string) => {
        completedShots += 1
        setGenerationStatus(
          Math.round(10 + (completedShots / shotCount) * 85),
          label,
        )
      }

      const runShot = async (
        shot: InfluencerShot,
        shotIndex: number,
        referenceUrls: string[] | undefined,
        seedOffset = 0,
      ): Promise<string> => {
        let prompt = ''
        const { imageUrl, attempts } = await generateShotWithRetry(async attempt => {
          prompt = buildInfluencerAnchorPrompt(baseFragment, shot, {
            ...promptCtxBase,
            shotIndex,
          })
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
        reportShotDone(`Rendered ${shot.label}`)
        return imageUrl
      }

      // ── Cover (1×, optional QA retry) ───────────────────────────────────
      const coverShot = shots[0]!
      const coverRefs =
        userReferenceImageUrls.length > 0 ? userReferenceImageUrls : undefined
      setGenerationStatus(12, 'Generating cover portrait')
      coverImageUrl = await runShot(coverShot, 0, coverRefs)

      if (COVER_QUALITY_GATE_ENABLED) {
        try {
          setGenerationStatus(22, 'Reviewing cover portrait')
          const quality = await evaluateAnchorPortrait(coverImageUrl, {
            referenceImageUrls:
              userReferenceImageUrls.length > 0 ? userReferenceImageUrls : undefined,
          })
          metadata.set('shot_front-portrait_quality', quality)
          if (!quality.pass) {
            logger.warn('Cover failed quality gate, regenerating once', {
              reason: quality.reason,
            })
            coverImageUrl = await runShot(coverShot, 0, coverRefs, 1)
          }
        } catch (gateError) {
          logger.warn('Cover quality gate unavailable, continuing', {
            error: gateError instanceof Error ? gateError.message : String(gateError),
          })
        }
      }

      galleryShots.push({
        shotId: coverShot.id,
        url: coverImageUrl,
        aspectRatio: coverShot.aspectRatio,
      })

      // ── Remaining shots in parallel ─────────────────────────────────────
      // With user refs: keep original refs + cover so aesthetic stays locked.
      // Without: cover alone (identity chain).
      const remaining = shots.slice(1)
      setGenerationStatus(30, `Rendering ${remaining.length} pack shots`)

      const packRefs =
        userReferenceImageUrls.length > 0
          ? [coverImageUrl!, ...userReferenceImageUrls].slice(0, 3)
          : [coverImageUrl!]

      const results = await Promise.allSettled(
        remaining.map((shot, i) => runShot(shot, i + 1, packRefs)),
      )

      let firstFailure: unknown
      for (let i = 0; i < results.length; i++) {
        const result = results[i]!
        const shot = remaining[i]!
        if (result.status === 'fulfilled') {
          galleryShots.push({
            shotId: shot.id,
            url: result.value,
            aspectRatio: shot.aspectRatio,
          })
        } else {
          firstFailure ??= result.reason
        }
      }

      if (galleryShots.length < 2) {
        throw firstFailure instanceof Error
          ? firstFailure
          : new Error('Anchor generation failed')
      }

      const galleryImageUrls = galleryShots.map(s => s.url)

      const updated = await updateInfluencer(payload.influencerId, {
        status: InfluencerStatus.READY,
        coverImageUrl,
        galleryImageUrls,
        galleryShots,
        identity: {
          ...(userReferenceImageUrls.length > 0
            ? { userReferenceImageUrls }
            : {}),
          referenceImageUrls: galleryImageUrls,
          shotPack: dbShotPack,
        },
        error: null,
      })

      setGenerationStatus(100, 'Complete')
      logger.info('Influencer ready', {
        influencerId: payload.influencerId,
        runId: ctx.run.id,
        shotPack,
        shots: galleryShots.length,
      })

      return {
        influencerId: payload.influencerId,
        coverImageUrl,
        galleryImageUrls,
        galleryShots,
        status: updated?.status ?? InfluencerStatus.READY,
      }
    } catch (error) {
      setGenerationFailure(error, 'Influencer generation failed')
      const galleryImageUrls = galleryShots.map(s => s.url)
      await updateInfluencer(payload.influencerId, {
        status: InfluencerStatus.FAILED,
        error: error instanceof Error ? error.message : 'Influencer generation failed',
        ...(galleryImageUrls.length > 0
          ? {
              coverImageUrl: coverImageUrl ?? galleryImageUrls[0],
              galleryImageUrls,
              galleryShots,
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
