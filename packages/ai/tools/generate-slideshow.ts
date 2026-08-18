import type { GenerateSlideshowInput, GenerateSlideshowResult, SkillModelConfig } from '@socialista/types'
import { generateObject } from 'ai'

import { buildSlideshowUserPrompt, SLIDESHOW_SYSTEM_PROMPT } from '../prompts/slideshow-prompt.js'
import {
  createSlideshowGeneratedSchema,
  slideshowToSlideTexts,
} from '../schemas/slideshow-generation.js'

const SLIDESHOW_MODEL = 'anthropic/claude-sonnet-4.6'

const MIN_SLIDE_COUNT = 2
const MAX_SLIDE_COUNT = 10

export async function generateSlideshow({
  hook,
  slideCount,
  systemPrompt,
  modelConfig,
}: GenerateSlideshowInput & {
  systemPrompt?: string
  modelConfig?: SkillModelConfig
}): Promise<GenerateSlideshowResult> {
  const trimmedHook = hook.trim()
  if (!trimmedHook) {
    throw new Error('Topic or directions are required')
  }

  const clampedCount = Math.min(Math.max(slideCount, MIN_SLIDE_COUNT), MAX_SLIDE_COUNT)
  const schema = createSlideshowGeneratedSchema(clampedCount)

  const result = await generateObject({
    model: modelConfig?.model ?? SLIDESHOW_MODEL,
    schema,
    system: systemPrompt ?? SLIDESHOW_SYSTEM_PROMPT,
    temperature: modelConfig?.temperature ?? 0.85,
    maxOutputTokens: modelConfig?.maxTokens,
    prompt: buildSlideshowUserPrompt(trimmedHook, clampedCount),
  })

  return {
    contentType: result.object.contentType,
    texts: slideshowToSlideTexts(result.object),
  }
}
