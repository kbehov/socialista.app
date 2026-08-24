import type { GenerateSlideshowInput, GenerateSlideshowResult } from '@socialista/types'
import { PROMPT_KEYS } from '@socialista/types'
import { generateObject } from 'ai'

import { resolvePrompt } from '../registry.js'
import { buildSlideshowUserPrompt } from '../builders/slideshow.js'
import {
  createSlideshowGeneratedSchema,
  slideshowToSlideTexts,
} from '../schemas/slideshow-generation.js'

const MIN_SLIDE_COUNT = 2
const MAX_SLIDE_COUNT = 10

export async function generateSlideshow({
  hook,
  slideCount,
  systemOverride,
}: GenerateSlideshowInput & {
  systemOverride?: string
}): Promise<GenerateSlideshowResult> {
  const trimmedHook = hook.trim()
  if (!trimmedHook) {
    throw new Error('Topic or directions are required')
  }

  const clampedCount = Math.min(Math.max(slideCount, MIN_SLIDE_COUNT), MAX_SLIDE_COUNT)
  const schema = createSlideshowGeneratedSchema(clampedCount)
  const { model, system } = resolvePrompt(PROMPT_KEYS.slideshow, systemOverride)

  const result = await generateObject({
    model,
    schema,
    system,
    temperature: 0.85,
    prompt: buildSlideshowUserPrompt(trimmedHook, clampedCount),
  })

  return {
    contentType: result.object.contentType,
    texts: slideshowToSlideTexts(result.object),
  }
}
