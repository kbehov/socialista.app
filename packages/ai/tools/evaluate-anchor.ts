import { generateObject } from 'ai'
import { z } from 'zod'

const ANCHOR_QUALITY_MODEL = 'anthropic/claude-sonnet-4.6'

const anchorQualitySchema = z.object({
  pass: z.boolean(),
  reason: z.string(),
})

export type AnchorQualityResult = z.infer<typeof anchorQualitySchema>

const ANCHOR_QUALITY_INSTRUCTIONS =
  'You are a strict photo QA reviewer for AI-generated influencer anchor portraits. ' +
  'Pass the image only if ALL of the following hold: ' +
  '(1) exactly one person with a sharp, fully visible, unobstructed face; ' +
  '(2) photorealistic skin with natural texture — not plastic, airbrushed, or CGI-looking; ' +
  '(3) no distorted anatomy (hands, eyes, teeth) and no duplicate people; ' +
  '(4) no text, watermarks, logos, or UI overlays. ' +
  'Fail anything borderline. Give a one-sentence reason.'

/** Vision check on a generated anchor portrait. Flag-gated by the caller. */
export async function evaluateAnchorPortrait(imageUrl: string): Promise<AnchorQualityResult> {
  const result = await generateObject({
    model: ANCHOR_QUALITY_MODEL,
    schema: anchorQualitySchema,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: ANCHOR_QUALITY_INSTRUCTIONS },
          { type: 'image', image: imageUrl },
        ],
      },
    ],
  })
  return result.object
}
