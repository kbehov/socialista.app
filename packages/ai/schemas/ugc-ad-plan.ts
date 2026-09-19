import {
  UGC_AD_PLAN_SCENE_MAX,
  UGC_CLIP_TYPES,
  UGC_DURATION_MAX,
  UGC_DURATION_MIN,
  UGC_SCRIPT_MAX_CHARS,
  formatUgcSceneCatalogForPrompt,
  ugcClipTypesWhere,
} from '@socialista/types'
import { z } from 'zod'

const SCRIPT_REQUIRED_TYPES = ugcClipTypesWhere(scene => scene.requiresScript).join('/')
const OPTIONAL_SCRIPT_TYPES = ugcClipTypesWhere(scene => !scene.requiresScript).join('/')

export const ugcAdPlanSceneSchema = z.object({
  name: z
    .string()
    .describe('Short scene title, 2–4 words. Names the beat, not the clip type. Example: "Bathroom confession".'),
  type: z
    .enum(UGC_CLIP_TYPES)
    .describe(`Prefer the standard type that matches the action:\n${formatUgcSceneCatalogForPrompt()}`),
  goal: z
    .string()
    .describe('One sentence: what this beat must make the viewer feel or believe. Specific, not "build interest".'),
  script: z
    .string()
    .describe(
      `Spoken first-person copy for ${SCRIPT_REQUIRED_TYPES}, max ${UGC_SCRIPT_MAX_CHARS} characters, sized to durationSec (~12 characters per second). Hook is a spoken opener line, not on-screen text. ${OPTIONAL_SCRIPT_TYPES}: empty string unless a short voiceover is clearly useful.`,
    ),
  imagePrompt: z
    .string()
    .describe(
      'One paragraph of comma-delimited visual clauses for the start-frame still. Subject first, camera/lens early, then pose, product placement, setting, light, palette. Lock the attached creator and product. No markdown, no negatives, no model names, no on-screen text.',
    ),
  videoPrompt: z
    .string()
    .describe(
      'One dense image-to-video motion paragraph from that still. Same person, product, room. Action that fits durationSec. No on-screen captions. No markdown.',
    ),
  durationSec: z
    .number()
    .int()
    .min(UGC_DURATION_MIN)
    .max(UGC_DURATION_MAX)
    .describe(
      `Clip length in seconds, ${UGC_DURATION_MIN}–${UGC_DURATION_MAX}. Hook ~5s, talking 6–10s, demos up to ${UGC_DURATION_MAX}.`,
    ),
})

export const ugcAdPlanSchema = z.object({
  concept: z
    .string()
    .describe('The campaign angle in 1–2 sentences. Named tension + payoff, not a generic "authentic UGC ad".'),
  format: z
    .string()
    .describe(
      'Trending format tag, lowercase kebab or short phrase. Examples: problem-solution, pov-day-in-life, unboxing-verdict, grwm, testimonial-receipt, hook-retain-reward, before-after.',
    ),
  targetAudience: z
    .string()
    .describe('Who this is for, one concrete line (age band, situation, platform habit). Not "everyone".'),
  scenes: z
    .array(ugcAdPlanSceneSchema)
    .min(1)
    .max(UGC_AD_PLAN_SCENE_MAX)
    .describe(
      `Ordered beats, 1–${UGC_AD_PLAN_SCENE_MAX}. Default to ${UGC_AD_PLAN_SCENE_MAX}: spoken hook first, proof/demo in the middle, CTA last. Every on-camera scene has a spoken script.`,
    ),
})

export type UgcAdPlanGenerated = z.infer<typeof ugcAdPlanSchema>
