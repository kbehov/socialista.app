import { generateObject } from 'ai'

import { buildSlideshowUserPrompt, SLIDESHOW_SYSTEM_PROMPT } from './prompts/slideshow-prompt'
import {
  createSlideshowGeneratedSchema,
  slideshowToSlideTexts,
  type SlideshowGenerated,
} from './schemas/slideshow-schema'

const SLIDESHOW_MODEL = 'anthropic/claude-sonnet-4.6'

const MIN_SLIDE_COUNT = 2
const MAX_SLIDE_COUNT = 10

export type GenerateSlideshowInput = {
  hook: string
  slideCount: number
}

export type GenerateSlideshowResult = {
  contentType: SlideshowGenerated['contentType']
  texts: string[]
}

export async function generateSlideshow({
  hook,
  slideCount,
}: GenerateSlideshowInput): Promise<GenerateSlideshowResult> {
  const trimmedHook = hook.trim()
  if (!trimmedHook) {
    throw new Error('Hook or topic is required')
  }

  const clampedCount = Math.min(Math.max(slideCount, MIN_SLIDE_COUNT), MAX_SLIDE_COUNT)
  const schema = createSlideshowGeneratedSchema(clampedCount)

  const result = await generateObject({
    model: SLIDESHOW_MODEL,
    schema,
    system: SLIDESHOW_SYSTEM_PROMPT,
    temperature: 0.85,
    prompt: buildSlideshowUserPrompt(trimmedHook, clampedCount),
  })

  return {
    contentType: result.object.contentType,
    texts: slideshowToSlideTexts(result.object),
  }
}
