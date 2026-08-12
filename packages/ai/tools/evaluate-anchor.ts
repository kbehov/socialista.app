import { INFLUENCER_MAX_USER_REFERENCE_IMAGES } from '@socialista/types'
import { generateObject } from 'ai'
import { z } from 'zod'

const ANCHOR_QUALITY_MODEL = 'openai/gpt-5.6-terra'

const anchorQualitySchema = z.object({
  pass: z.boolean(),
  reason: z.string(),
})

export type AnchorQualityResult = z.infer<typeof anchorQualitySchema>

const ANCHOR_QUALITY_INSTRUCTIONS =
  'You are a strict photo QA reviewer for AI-generated influencer cover portraits. ' +
  'Pass only if ALL hold: (1) exactly one person with a sharp, fully visible, unobstructed face; ' +
  '(2) photorealistic natural skin — not plastic or CGI; ' +
  '(3) no distorted anatomy and no duplicate people; ' +
  '(4) no text, watermarks, logos, or UI. ' +
  'Lived-in niche backgrounds (kitchen, gym, café, office, etc.) are good and must not cause a fail. ' +
  'Fail anything borderline. One-sentence reason.'

const LOOKALIKE_ARCHETYPE_ADDENDUM =
  ' Style reference photos are attached after the cover (first image = generated cover, following images = user references). ' +
  'Require alignment with references: same scene/setting type, dominant color palette, lighting direction, composition energy, and Pinterest-ready photographic polish — NOT the same face or body. ' +
  'PASS if photoreal, a clearly different person from references, and the cover feels like the same frame/world as the references (not a generic bland portrait). ' +
  'FAIL if the cover ignores reference scene/colors (e.g. wrong location type, flat studio look vs reference gym daylight) or copies the reference person\'s identity.'

/** @deprecated Use LOOKALIKE_ARCHETYPE_ADDENDUM */
const HYBRID_LIKENESS_ADDENDUM = LOOKALIKE_ARCHETYPE_ADDENDUM

export type EvaluateAnchorPortraitOptions = {
  /** Optional hybrid user refs for likeness / vibe alignment. */
  referenceImageUrls?: string[]
}

/** Single vision check on the cover portrait before chaining references. */
export async function evaluateAnchorPortrait(
  imageUrl: string,
  options?: EvaluateAnchorPortraitOptions,
): Promise<AnchorQualityResult> {
  const refs = (options?.referenceImageUrls ?? [])
    .map(url => url.trim())
    .filter(Boolean)
    .slice(0, INFLUENCER_MAX_USER_REFERENCE_IMAGES)
  const hasRefs = refs.length > 0

  const instructions = hasRefs
    ? ANCHOR_QUALITY_INSTRUCTIONS + LOOKALIKE_ARCHETYPE_ADDENDUM
    : ANCHOR_QUALITY_INSTRUCTIONS

  const result = await generateObject({
    model: ANCHOR_QUALITY_MODEL,
    schema: anchorQualitySchema,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: instructions },
          { type: 'image', image: imageUrl },
          ...refs.map(image => ({ type: 'image' as const, image })),
        ],
      },
    ],
  })
  return result.object
}
