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

export function createSlideshowGeneratedSchema(slideCount?: number) {
  const auto = slideCount == null
  const slidesField = auto
    ? z
        .array(slideTextSchema)
        .min(SLIDESHOW_GENERATION_SLIDE_COUNT_MIN)
        .max(SLIDESHOW_GENERATION_SLIDE_COUNT_MAX)
        .describe(
          `The full ordered deck. First item is the hook. Choose ${SLIDESHOW_GENERATION_SLIDE_COUNT_MIN}–${SLIDESHOW_GENERATION_SLIDE_COUNT_MAX} slides. Do not add a CTA slide unless the prompt asks for one or it earns the ending. Pack requested items instead of padding with a CTA.`,
        )
    : z
        .array(slideTextSchema)
        .length(slideCount)
        .describe(
          `The full ordered deck. First item is the hook. Exactly ${slideCount} slides. Do not force the last slide to be a CTA. Pack requested items when they would not fit one-per-slide.`,
        )

  return z.object({
    contentType: slideshowContentTypeSchema.describe(
      'Best-fit format for this hook: story (personal journey), guide (how-to), list (fast tips), routine (habit flow), comparison (X vs Y), myth (debunking a belief)',
    ),
    slides: slidesField,
  })
}

export type SlideshowGenerated = z.infer<ReturnType<typeof createSlideshowGeneratedSchema>>

export function slideshowToSlideTexts(result: SlideshowGenerated): string[] {
  return result.slides.map(slide => slide.text)
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
    'full-bleed: photo fills the slide behind the copy. split and minimal are unused — always pick full-bleed.',
  ),
})

export function createSlideshowPlanSchema(slideCount?: number) {
  const slidesField =
    slideCount == null
      ? z
          .array(plannedSlideSchema)
          .min(SLIDESHOW_GENERATION_SLIDE_COUNT_MIN)
          .max(SLIDESHOW_GENERATION_SLIDE_COUNT_MAX)
          .describe(
            `The full ordered deck. First item is the hook. Choose ${SLIDESHOW_GENERATION_SLIDE_COUNT_MIN}–${SLIDESHOW_GENERATION_SLIDE_COUNT_MAX} slides. Do not add a CTA slide unless it belongs. Pack requested items when they outnumber the remaining slides. Every slide is full-bleed with its own photo background.`,
          )
      : z
          .array(plannedSlideSchema)
          .length(slideCount)
          .describe(
            `The full ordered deck. First item is the hook. Exactly ${slideCount} slides. Do not force the last slide to be a CTA. Pack requested items onto content slides when they would not fit one-per-slide. Every slide is full-bleed with its own photo background.`,
          )

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
    slides: slidesField,
  })
}

export type SlideshowPlanGenerated = z.infer<ReturnType<typeof createSlideshowPlanSchema>>

export function slideshowPlanFromGenerated(
  result: SlideshowPlanGenerated,
  slideCount?: number,
): SlideshowPlan {
  const limit = slideCount ?? SLIDESHOW_GENERATION_SLIDE_COUNT_MAX
  const slides = result.slides.slice(0, limit)
  return {
    contentType: result.contentType,
    name: result.name.trim() || 'Untitled slideshow',
    theme: result.theme,
    slides: slides.map(slide => ({ ...slide, layout: 'full-bleed' as const })),
  }
}
