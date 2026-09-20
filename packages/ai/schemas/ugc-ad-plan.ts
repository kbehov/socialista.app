import {
  UGC_AD_PLAN_FORMATS,
  UGC_AD_PLAN_SCENE_MAX,
  UGC_CLIP_TYPES,
  UGC_DURATION_MAX,
  UGC_DURATION_MIN,
  UGC_SCRIPT_MAX_CHARS,
  UGC_TALKING_HEAD_SCRIPT_MAX_CHARS,
  formatUgcSceneCatalogForPrompt,
  ugcClipTypesWhere,
  type UgcClipType,
} from '@socialista/types'
import { z } from 'zod'

function asEnumValues(types: readonly UgcClipType[]): [UgcClipType, ...UgcClipType[]] {
  return (types.length > 0 ? types : UGC_CLIP_TYPES) as [UgcClipType, ...UgcClipType[]]
}

export function ugcAdPlanSchema(allowedTypes: readonly UgcClipType[]) {
  const types = asEnumValues(allowedTypes)
  const catalog = formatUgcSceneCatalogForPrompt(types)
  const SCRIPT_REQUIRED_TYPES =
    ugcClipTypesWhere(scene => scene.requiresScript)
      .filter(type => types.includes(type))
      .join('/') || 'talking scenes'
  const OPTIONAL_SCRIPT_TYPES = ugcClipTypesWhere(scene => !scene.requiresScript)
    .filter(type => types.includes(type))
    .join('/')

  const ugcAdPlanSceneSchema = z.object({
    type: z
      .enum(types)
      .describe(
        `Catalog slug only — never a creative title. Pick the closest match:\n${catalog}`,
      ),
    goal: z
      .string()
      .describe('One sentence: what this beat must make the viewer feel or believe. Specific, not "build interest".'),
    script: z
      .string()
      .describe(
        [
          `Spoken first-person copy for ${SCRIPT_REQUIRED_TYPES}. Talking-head max ${UGC_TALKING_HEAD_SCRIPT_MAX_CHARS} characters; other talking scenes max ${UGC_SCRIPT_MAX_CHARS}. Budget about durationSec × 12 characters so it fits the clip. Hook is a spoken opener line, not on-screen text.`,
          OPTIONAL_SCRIPT_TYPES
            ? `${OPTIONAL_SCRIPT_TYPES}: empty string unless a short voiceover is clearly useful.`
            : '',
        ]
          .filter(Boolean)
          .join(' '),
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

  return z.object({
    concept: z
      .string()
      .describe('The campaign angle in 1–2 sentences. Named tension + payoff, not a generic "authentic UGC ad".'),
    format: z
      .enum(UGC_AD_PLAN_FORMATS)
      .describe(
        `Campaign format tag. One of: ${UGC_AD_PLAN_FORMATS.join(', ')}. Not a scene type. Never invent a new tag.`,
      ),
    targetAudience: z
      .string()
      .describe('Who this is for, one concrete line (age band, situation, platform habit). Not "everyone".'),
    scenes: z
      .array(ugcAdPlanSceneSchema)
      .min(1)
      .max(UGC_AD_PLAN_SCENE_MAX)
      .describe(
        `Ordered beats, 1–${UGC_AD_PLAN_SCENE_MAX}. Default to ${UGC_AD_PLAN_SCENE_MAX}: spoken hook first, proof/demo in the middle, CTA last. type must be a catalog slug from the list above.`,
      ),
  })
}

export type UgcAdPlanGenerated = z.infer<ReturnType<typeof ugcAdPlanSchema>>
