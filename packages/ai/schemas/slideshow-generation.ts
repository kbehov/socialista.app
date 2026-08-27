import {
  SLIDESHOW_CONTENT_TYPES,
  SLIDESHOW_GENERATION_SLIDE_COUNT_MAX,
  SLIDESHOW_GENERATION_SLIDE_COUNT_MIN,
  SLIDESHOW_LAYOUTS,
  type SlideshowPlan,
} from '@socialista/types'
import { z } from 'zod'

export const slideshowContentTypeSchema = z.enum(SLIDESHOW_CONTENT_TYPES)

const HEX_COLOR_REGEX = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/

const PLAN_FONT_FAMILIES = [
  'Inter, system-ui, sans-serif',
  'Impact, Haettenschweiler, sans-serif',
  'Georgia, serif',
  '"Arial Black", Gadget, sans-serif',
  'Helvetica, Arial, sans-serif',
] as const

const slideTextSchema = z.object({
  text: z
    .string()
    .describe('Plain slide copy only — no markdown, emojis, or hashtags. Renders directly on canvas.'),
})

export function createSlideshowGeneratedSchema(slideCount: number) {
  const middleCount = Math.max(0, slideCount - 2)

  return z.object({
    contentType: slideshowContentTypeSchema.describe(
      'Best-fit format for this hook: story (personal journey), guide (how-to), list (fast tips), routine (habit flow), comparison (X vs Y), myth (debunking a belief)',
    ),
    hook: z
      .string()
      .describe(
        'Slide 1 — scroll-stopping hook. Max 12–14 words. No trailing period. Rewrite user input to be punchier.',
      ),
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

const hexColor = z.string().regex(HEX_COLOR_REGEX).describe('6-digit hex color like #0f0f0f')

const plannedSlideSchema = z.object({
  text: z
    .string()
    .describe('Plain slide copy only — no markdown, emojis, or hashtags. Renders directly on canvas.'),
  imageQuery: z
    .string()
    .describe(
      '2–4 word stock-photo search phrase for this slide (concrete nouns, no quotes). Example: empty coffee shop',
    ),
  layout: z.enum(SLIDESHOW_LAYOUTS).describe(
    'full-bleed: photo background + overlay + white text. split: color panel + photo. minimal: solid color, text only.',
  ),
})

export function createSlideshowPlanSchema(slideCount: number) {
  return z.object({
    contentType: slideshowContentTypeSchema.describe(
      'Best-fit format for this hook: story (personal journey), guide (how-to), list (fast tips), routine (habit flow), comparison (X vs Y), myth (debunking a belief)',
    ),
    name: z
      .string()
      .describe('Short slideshow title for the editor, 3–6 words, no quotes.'),
    theme: z.object({
      backgroundColor: hexColor.describe('Solid slide fill used on split/minimal layouts'),
      textColor: hexColor.describe('Primary text color on split/minimal layouts'),
      accentColor: hexColor.describe('Accent used sparingly for emphasis'),
      fontFamily: z.enum(PLAN_FONT_FAMILIES).describe('One typeface for the whole deck'),
    }),
    slides: z
      .array(plannedSlideSchema)
      .min(SLIDESHOW_GENERATION_SLIDE_COUNT_MIN)
      .max(SLIDESHOW_GENERATION_SLIDE_COUNT_MAX)
      .describe(
        `The full ordered deck. First item is the hook, last item is the CTA. Aim for ${slideCount} slides. Vary layout across the deck.`,
      ),
  })
}

export type SlideshowPlanGenerated = z.infer<ReturnType<typeof createSlideshowPlanSchema>>

export function slideshowPlanFromGenerated(
  result: SlideshowPlanGenerated,
  slideCount: number,
): SlideshowPlan {
  const slides = result.slides.slice(0, slideCount)
  return {
    contentType: result.contentType,
    name: result.name.trim() || 'Untitled slideshow',
    theme: result.theme,
    slides,
  }
}
