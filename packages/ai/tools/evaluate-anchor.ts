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

/** Single vision check on the cover portrait before chaining references. */
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
