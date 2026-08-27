import type { PlanSlideshowInput, SlideshowPlan } from '@socialista/types'
import {
  PROMPT_KEYS,
  SLIDESHOW_GENERATION_SLIDE_COUNT_MAX,
  SLIDESHOW_GENERATION_SLIDE_COUNT_MIN,
} from '@socialista/types'
import { generateObject } from 'ai'

import { resolvePrompt } from '../registry.js'
import { buildSlideshowPlanUserPrompt } from '../builders/slideshow.js'
import {
  createSlideshowPlanSchema,
  slideshowPlanFromGenerated,
} from '../schemas/slideshow-generation.js'

export async function planSlideshow({
  hook,
  slideCount,
  systemOverride,
}: PlanSlideshowInput & {
  systemOverride?: string
}): Promise<SlideshowPlan> {
  const trimmedHook = hook.trim()
  if (!trimmedHook) {
    throw new Error('Topic or directions are required')
  }

  const clampedCount = Math.min(
    Math.max(slideCount, SLIDESHOW_GENERATION_SLIDE_COUNT_MIN),
    SLIDESHOW_GENERATION_SLIDE_COUNT_MAX,
  )
  const schema = createSlideshowPlanSchema(clampedCount)
  const { model, system } = resolvePrompt(PROMPT_KEYS.slideshow, systemOverride)

  const result = await generateObject({
    model,
    schema,
    system,
    temperature: 0.85,
    prompt: buildSlideshowPlanUserPrompt(trimmedHook, clampedCount),
  })

  const plan = slideshowPlanFromGenerated(result.object, clampedCount)
  if (plan.slides.length === 0) {
    throw new Error('No slides were planned')
  }

  return plan
}
