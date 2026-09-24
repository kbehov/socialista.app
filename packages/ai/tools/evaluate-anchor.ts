import { generateObject } from 'ai'
import { z } from 'zod'

const ANCHOR_QUALITY_MODEL = 'openai/gpt-6-sol'

const anchorQualitySchema = z.object({
  pass: z.boolean(),
  reason: z.string(),
})

export type AnchorQualityResult = z.infer<typeof anchorQualitySchema>

const ANCHOR_QUALITY_INSTRUCTIONS =
  'You are a strict photo QA reviewer for AI-generated influencer cover portraits. ' +
  'Pass only if ALL hold: (1) exactly one person with a sharp, fully visible, unobstructed face; ' +
  '(2) photorealistic natural skin with visible pore texture — fail plastic, waxy, airbrushed, or heavy beauty-filter smoothing; ' +
  '(3) no distorted anatomy, no duplicate people, no extra or fused fingers on visible hands; ' +
  '(4) no text, watermarks, logos, or UI; ' +
  '(5) not a flat passport studio or blank seamless when a lived-in environment was expected. ' +
  'Lived-in niche backgrounds (kitchen, gym, café, bedroom, etc.) are good and must not cause a fail. ' +
  'Fail anything borderline. One-sentence reason.'

/** Single vision check on the cover portrait before chaining references. */
export async function evaluateAnchorPortrait(imageUrl: string): Promise<AnchorQualityResult> {
  const result = await generateObject({
    model: ANCHOR_QUALITY_MODEL,
    schema: anchorQualitySchema,
    instructions: ANCHOR_QUALITY_INSTRUCTIONS,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Review the cover portrait. The first image is the generated cover.' },
          { type: 'image', image: imageUrl },
        ],
      },
    ],
  })
  return result.object
}
