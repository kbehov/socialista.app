import { z } from 'zod'

export const slideshowContentTypeSchema = z.enum(['story', 'guide', 'list', 'routine'])

export type SlideshowContentType = z.infer<typeof slideshowContentTypeSchema>

const slideTextSchema = z.object({
  text: z
    .string()
    .describe('Plain slide copy only — no markdown, emojis, or hashtags. Renders directly on canvas.'),
})

export function createSlideshowGeneratedSchema(slideCount: number) {
  const middleCount = Math.max(0, slideCount - 2)

  return z.object({
    contentType: slideshowContentTypeSchema.describe(
      'Best-fit format for this hook: story (personal journey), guide (how-to), list (fast tips), routine (habit flow)',
    ),
    hook: z
      .string()
      .describe('Slide 1 — scroll-stopping hook. Max 12–14 words. No trailing period. Rewrite user input to be punchier.'),
    slides: z
      .array(slideTextSchema)
      .length(middleCount)
      .describe(
        middleCount === 0
          ? 'No middle slides — hook flows straight to CTA'
          : `Exactly ${middleCount} middle slide(s) between hook and CTA`,
      ),
    cta: z
      .string()
      .describe('Final slide — one clear action tied back to the hook promise (follow, save, comment keyword, share)'),
  })
}

export type SlideshowGenerated = z.infer<ReturnType<typeof createSlideshowGeneratedSchema>>

export function slideshowToSlideTexts(result: SlideshowGenerated): string[] {
  return [result.hook, ...result.slides.map(slide => slide.text), result.cta]
}
