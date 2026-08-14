import {
  buildInfluencerAnchorPrompt,
  buildInfluencerBasePromptFragment,
  buildInfluencerCharacterSheet,
  evaluateAnchorPortrait,
  generateImage,
  getInfluencerGenerationShots,
  type InfluencerShot,
} from "@socialista/ai";
import {
  connectDb,
  disconnectDb,
  getInfluencerById,
  InfluencerStatus,
  updateInfluencer,
} from "@socialista/db";
import {
  clampInfluencerShotCount,
  INFLUENCER_GENERATION_SHOT_COUNT,
  INFLUENCER_MAX_USER_REFERENCE_IMAGES,
  TASK_IDS,
  type InfluencerGalleryShot,
} from "@socialista/types";
import { logger, metadata, schemaTask } from "@trigger.dev/sdk/v3";

import { generateInfluencerPayloadSchema } from "../../schemas/generate-influencer.schema.js";
import {
  setGenerationFailure,
  setGenerationStatus,
} from "../shared/metadata.js";
import {
  assertSufficientCredits,
  finalizeGeneration,
  loadModelAndWorkspace,
} from "../shared/workspace.js";

const SHOT_MAX_ATTEMPTS = 2;
const SHOT_RETRY_DELAY_MS = 1500;
/** Cover QA on by default; set INFLUENCER_COVER_QUALITY_GATE=false to skip. */
const COVER_QUALITY_GATE_ENABLED =
  process.env.INFLUENCER_COVER_QUALITY_GATE !== "false";

async function generateShotWithRetry(
  generate: (attempt: number) => Promise<string>,
  shotId: string,
): Promise<{ imageUrl: string; attempts: number }> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= SHOT_MAX_ATTEMPTS; attempt++) {
    try {
      return { imageUrl: await generate(attempt), attempts: attempt };
    } catch (error) {
      lastError = error;
      logger.warn("Influencer shot failed", {
        shotId,
        attempt,
        maxAttempts: SHOT_MAX_ATTEMPTS,
        error: error instanceof Error ? error.message : String(error),
      });
      if (attempt < SHOT_MAX_ATTEMPTS) {
        await new Promise((resolve) =>
          setTimeout(resolve, SHOT_RETRY_DELAY_MS * attempt),
        );
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`Failed to generate shot: ${shotId}`);
}

/**
 * Influencer generation (1–3 shots):
 * 1) Character sheet once (vision LLM when user style ref — richer identity + scene lock)
 * 2) Cover portrait with user style ref when provided (+ optional QA retry without refs only)
 * 3) Follow-ups in parallel — cover portrait only as image reference (identity chain)
 */
export const generateInfluencer = schemaTask({
  id: TASK_IDS.generateInfluencer,
  schema: generateInfluencerPayloadSchema,
  maxDuration: 600,
  retry: { maxAttempts: 1 },
  run: async (payload, { ctx }) => {
    const galleryShots: InfluencerGalleryShot[] = [];
    let coverImageUrl: string | undefined;

    try {
      await connectDb();

      const influencer = await getInfluencerById(payload.influencerId);
      if (!influencer) {
        throw new Error("Influencer not found");
      }

      const shotCount = clampInfluencerShotCount(
        payload.shotCount ?? INFLUENCER_GENERATION_SHOT_COUNT,
      );
      const shots = getInfluencerGenerationShots(shotCount);

      await updateInfluencer(payload.influencerId, {
        status: InfluencerStatus.GENERATING,
        error: null,
      });

      const { model, workspace } = await loadModelAndWorkspace(
        payload.model,
        payload.workspaceId,
      );
      assertSufficientCredits(workspace, model.cost * shotCount);

      let characterSheet = influencer.identity.characterSheet;
      let baseFragment = influencer.identity.basePromptFragment;
      const userReferenceImageUrls = (
        influencer.identity.userReferenceImageUrls ?? []
      )
        .map((url) => url.trim())
        .filter(Boolean)
        .slice(0, INFLUENCER_MAX_USER_REFERENCE_IMAGES);
      const hasUserRefs = userReferenceImageUrls.length > 0;

      // ── Step 0: character sheet (once — vision LLM when style ref attached) ─
      setGenerationStatus(
        5,
        hasUserRefs
          ? "Building character sheet from reference"
          : "Building character sheet",
      );

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
          ...(hasUserRefs
            ? { referenceImageUrls: userReferenceImageUrls }
            : {}),
        });
        baseFragment = buildInfluencerBasePromptFragment({
          name: influencer.name,
          gender: influencer.gender,
          ageRange: influencer.ageRange,
          ethnicity: influencer.ethnicity,
          appearance: influencer.appearance,
          characterSheet,
          preferReferenceAppearance: hasUserRefs,
        });
        await updateInfluencer(payload.influencerId, {
          identity: {
            characterSheet,
            basePromptFragment: baseFragment,
          },
        });
        metadata.set("character_sheet", {
          ...characterSheet,
          wardrobe: { ...characterSheet.wardrobe },
        });
      } catch (sheetError) {
        logger.warn(
          "Character sheet unavailable, using deterministic fragment",
          {
            error:
              sheetError instanceof Error
                ? sheetError.message
                : String(sheetError),
          },
        );
        baseFragment = buildInfluencerBasePromptFragment({
          name: influencer.name,
          gender: influencer.gender,
          ageRange: influencer.ageRange,
          ethnicity: influencer.ethnicity,
          appearance: influencer.appearance,
          preferReferenceAppearance: hasUserRefs,
        });
      }

      logger.info("Generating influencer gallery", {
        influencerId: payload.influencerId,
        model: model.value,
        shots: shotCount,
        userReferenceCount: userReferenceImageUrls.length,
        referenceMode: hasUserRefs ? "style-scene" : "none",
      });

      if (hasUserRefs) {
        metadata.set("reference_mode", "style-scene");
        metadata.set("reference_chain", "cover-only-followups");
      }

      const promptCtxBase = {
        niche: influencer.niche,
        scenes: influencer.scenes,
        accessories: influencer.appearance.accessories,
        aestheticTags: influencer.aestheticTags,
        characterSheet,
        photoStyle: influencer.photoStyle,
        directions: influencer.directions,
        ...(hasUserRefs
          ? { userReferenceCount: userReferenceImageUrls.length }
          : {}),
      };

      const buildShotPromptCtx = (shotIndex: number) => {
        if (shotIndex > 0 && hasUserRefs) {
          const { userReferenceCount: _omit, ...rest } = promptCtxBase;
          return { ...rest, shotIndex, coverChainOnly: true as const };
        }
        return { ...promptCtxBase, shotIndex };
      };

      const seedBase = model.modelProvider.toLowerCase().includes("fal")
        ? influencer.identity.seed
        : undefined;

      let completedShots = 0;
      const reportShotDone = (label: string) => {
        completedShots += 1;
        setGenerationStatus(
          Math.round(10 + (completedShots / shotCount) * 85),
          label,
        );
      };

      const runShot = async (
        shot: InfluencerShot,
        shotIndex: number,
        referenceUrls: string[] | undefined,
        seedOffset = 0,
      ): Promise<string> => {
        let prompt = "";
        const { imageUrl, attempts } = await generateShotWithRetry(
          async (attempt) => {
            prompt = buildInfluencerAnchorPrompt(
              baseFragment,
              shot,
              buildShotPromptCtx(shotIndex),
            );
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
                    ? seedBase +
                      shotIndex * 1000 +
                      seedOffset * 100 +
                      (attempt - 1)
                    : undefined,
              },
              shotIndex === 0 ? setGenerationStatus : undefined,
            );
          },
          shot.id,
        );
        metadata.set(`shot_${shot.id}`, { prompt, imageUrl, attempts });
        await finalizeGeneration(payload.workspaceId, model);
        reportShotDone(`Rendered ${shot.label}`);
        return imageUrl;
      };

      // ── Cover: user style ref on first shot only ───────────────────────────
      const coverShot = shots[0]!;
      const coverRefs = hasUserRefs ? userReferenceImageUrls : undefined;
      setGenerationStatus(
        12,
        hasUserRefs
          ? "Generating cover — matching reference scene & palette"
          : "Generating cover portrait",
      );
      coverImageUrl = await runShot(coverShot, 0, coverRefs);

      // QA + regen only without user refs — refs already steer the cover; regen would bill a 4th image.
      if (COVER_QUALITY_GATE_ENABLED && !hasUserRefs) {
        try {
          setGenerationStatus(22, "Reviewing cover portrait");
          const quality = await evaluateAnchorPortrait(coverImageUrl);
          metadata.set("shot_front-portrait_quality", quality);
          if (!quality.pass) {
            logger.warn("Cover failed quality gate, regenerating once", {
              reason: quality.reason,
            });
            coverImageUrl = await runShot(coverShot, 0, coverRefs, 1);
          }
        } catch (gateError) {
          logger.warn("Cover quality gate unavailable, continuing", {
            error:
              gateError instanceof Error
                ? gateError.message
                : String(gateError),
          });
        }
      }

      galleryShots.push({
        shotId: coverShot.id,
        url: coverImageUrl,
        aspectRatio: coverShot.aspectRatio,
      });

      // ── Follow-ups: cover portrait only (identity + aesthetic chain) ─────
      const remaining = shots.slice(1);
      if (remaining.length > 0) {
        setGenerationStatus(30, `Rendering ${remaining.length} gallery shots`);

        const packRefs = [coverImageUrl!];

        const results = await Promise.allSettled(
          remaining.map((shot, i) => runShot(shot, i + 1, packRefs)),
        );

        let firstFailure: unknown;
        for (let i = 0; i < results.length; i++) {
          const result = results[i]!;
          const shot = remaining[i]!;
          if (result.status === "fulfilled") {
            galleryShots.push({
              shotId: shot.id,
              url: result.value,
              aspectRatio: shot.aspectRatio,
            });
          } else {
            firstFailure ??= result.reason;
          }
        }

        if (
          galleryShots.length === 0 ||
          (shotCount > 1 && galleryShots.length < 2)
        ) {
          throw firstFailure instanceof Error
            ? firstFailure
            : new Error("Anchor generation failed");
        }
      }

      const galleryImageUrls = galleryShots.map((s) => s.url);

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
        },
        error: null,
      });

      setGenerationStatus(100, "Complete");
      logger.info("Influencer ready", {
        influencerId: payload.influencerId,
        runId: ctx.run.id,
        shots: galleryShots.length,
      });

      return {
        influencerId: payload.influencerId,
        coverImageUrl,
        galleryImageUrls,
        galleryShots,
        status: updated?.status ?? InfluencerStatus.READY,
      };
    } catch (error) {
      setGenerationFailure(error, "Influencer generation failed");
      const galleryImageUrls = galleryShots.map((s) => s.url);
      await updateInfluencer(payload.influencerId, {
        status: InfluencerStatus.FAILED,
        error:
          error instanceof Error
            ? error.message
            : "Influencer generation failed",
        ...(galleryImageUrls.length > 0
          ? {
              coverImageUrl: coverImageUrl ?? galleryImageUrls[0],
              galleryImageUrls,
              galleryShots,
              identity: { referenceImageUrls: galleryImageUrls },
            }
          : {}),
      }).catch(() => undefined);
      throw error as Error;
    } finally {
      await disconnectDb();
    }
  },
});
