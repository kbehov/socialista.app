import { STATIC_AD_TEMPLATE_FORMATS } from '@socialista/types'
import { z } from 'zod'

export const staticAdTemplateAnalysisSchema = z.object({
  format: z.enum(STATIC_AD_TEMPLATE_FORMATS),
  layout: z.string().trim().min(1).max(400),
  typeHierarchy: z.string().trim().min(1).max(400),
  palette: z
    .array(
      z.object({
        hex: z.string().trim().min(1).max(16),
        role: z.string().trim().min(1).max(40),
      }),
    )
    .min(1)
    .max(6),
  hookStyle: z.string().trim().min(1).max(160),
  sceneJob: z.string().trim().min(1).max(300),
  aspectRatioHint: z.enum(['1:1', '9:16', '16:9', '4:3']).optional(),
})

export type StaticAdTemplateAnalysis = z.infer<typeof staticAdTemplateAnalysisSchema>

export const STATIC_AD_TEMPLATE_ANALYSIS_SYSTEM = `
You analyze one finished static ad image and return a structural blueprint another model can recreate without copying the brand.

Describe the ad's skeleton. Do not transcribe the headline, brand name, logo lettering, or packaging copy. hookStyle is the rhetorical pattern (curiosity gap, confession, stat, challenge, benefit), not the words on the image.

format — pick exactly one:
- ugc: phone-native creator still, selfie, hold, reaction, GRWM
- apparel-ugc: mirror try-on, haul, outfit
- screenshot: text message, review card, search UI, comparison chrome
- meme: caption-led relatable still
- cinematic: campaign, editorial, splash, macro, surreal hero
- demo: unboxing, pour, apply, in-use peak
- graphic: type-led layout, stat, spec, offer, countdown
- lifestyle: lived-in product moment that is not phone UGC

layout: 1–2 sentences. Composition skeleton only (what occupies which region, crop, depth). No brand names.
typeHierarchy: where the headline, any subline, and CTA sit, plus relative weight. Do not quote the copy.
palette: 2–5 colors as hex with a role (background, type, accent, surface, product-field). These are the template's original colors.
hookStyle: the pattern, under 12 words.
sceneJob: who does what with what, using generic roles (creator holds product, product beside a stat). No identifiable person, no brand.
aspectRatioHint: closest of 1:1, 9:16, 16:9, 4:3. Omit only if the frame is ambiguous.
`.trim()
