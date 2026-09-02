import type { GenerateSlideshowInput, GenerateSlideshowResult } from '@socialista/types'
import {
  PROMPT_KEYS,
  SLIDESHOW_GENERATION_SLIDE_COUNT_MAX,
  SLIDESHOW_GENERATION_SLIDE_COUNT_MIN,
} from '@socialista/types'
import { generateObject } from 'ai'

import { resolvePrompt } from '../registry.js'
import { buildSlideshowUserPrompt } from '../builders/slideshow.js'
import {
  createSlideshowGeneratedSchema,
  slideshowToSlideTexts,
} from '../schemas/slideshow-generation.js'

export async function generateSlideshow({
  hook,
  slideCount,
  model: modelOverride,
  systemOverride,
}: GenerateSlideshowInput & {
  systemOverride?: string
}): Promise<GenerateSlideshowResult> {
  const trimmedHook = hook.trim()
  if (!trimmedHook) {
    throw new Error('Topic or directions are required')
  }

  const resolvedCount =
    typeof slideCount === 'number' && Number.isFinite(slideCount)
      ? Math.min(
          Math.max(Math.round(slideCount), SLIDESHOW_GENERATION_SLIDE_COUNT_MIN),
          SLIDESHOW_GENERATION_SLIDE_COUNT_MAX,
        )
      : undefined
  const schema = createSlideshowGeneratedSchema(resolvedCount)
  const { model: defaultModel, system } = resolvePrompt(PROMPT_KEYS.slideshow, systemOverride)
  const model = modelOverride?.trim() || defaultModel

  const result = await generateObject({
    model,
    schema,
    system,
    temperature: 0.85,
    prompt: buildSlideshowUserPrompt(trimmedHook, resolvedCount),
  })

  return {
    contentType: result.object.contentType,
    texts: slideshowToSlideTexts(result.object),
  }
}
