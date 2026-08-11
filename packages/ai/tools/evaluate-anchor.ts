import { generateObject } from 'ai'
import { z } from 'zod'

const ANCHOR_QUALITY_MODEL = 'openai/gpt-5.6-terra'
const MAX_REFERENCE_IMAGES = 3

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

const HYBRID_LIKENESS_ADDENDUM =
  ' Additional reference photos of the intended look are attached after the cover. ' +
  'Require BOTH reasonable facial likeness AND aesthetic/vibe alignment with those references ' +
  '(lighting quality, color grade, wardrobe energy, environment family, photographic style) — not a pixel clone. ' +
  'Fail if the cover keeps the face but invents a different aesthetic world from the references.'

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
    .slice(0, MAX_REFERENCE_IMAGES)
  const hasRefs = refs.length > 0

  const instructions = hasRefs
    ? ANCHOR_QUALITY_INSTRUCTIONS + HYBRID_LIKENESS_ADDENDUM
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
