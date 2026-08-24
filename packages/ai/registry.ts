import { PROMPT_KEYS, type PromptKey } from '@socialista/types'

import { POST_COPY_SYSTEM } from './prompts/post-copy.js'
import { IMAGE_PROMPT_SYSTEM } from './prompts/image.js'
import { SLIDESHOW_SYSTEM } from './prompts/slideshow.js'
import { STATIC_AD_VISION_SYSTEM } from './prompts/static-ad.js'
import { UGC_AD_SCRIPT_SYSTEM } from './prompts/ugc-ad-script.js'
import { UGC_VIDEO_PLANNER_SYSTEM } from './prompts/ugc-video-planner.js'
import { VIDEO_PROMPT_SYSTEM } from './prompts/video.js'
import { VIDEO_SCRIPT_SYSTEM } from './prompts/video-script.js'

type PromptDefinition = { system: string; model: string }

export const PROMPT_REGISTRY: Record<PromptKey, PromptDefinition> = {
  [PROMPT_KEYS.imagePrompt]: { system: IMAGE_PROMPT_SYSTEM, model: 'openai/gpt-5.6-terra' },
  [PROMPT_KEYS.videoPrompt]: { system: VIDEO_PROMPT_SYSTEM, model: 'openai/gpt-5.6-terra' },
  [PROMPT_KEYS.staticAd]: { system: STATIC_AD_VISION_SYSTEM, model: 'openai/gpt-5.6-sol' },
  [PROMPT_KEYS.ugcVideoPlanner]: { system: UGC_VIDEO_PLANNER_SYSTEM, model: 'openai/gpt-5.6-terra' },
  [PROMPT_KEYS.ugcAdScript]: { system: UGC_AD_SCRIPT_SYSTEM, model: 'openai/gpt-5.6-luna' },
  [PROMPT_KEYS.videoScript]: { system: VIDEO_SCRIPT_SYSTEM, model: 'anthropic/claude-sonnet-4.6' },
  [PROMPT_KEYS.slideshow]: { system: SLIDESHOW_SYSTEM, model: 'anthropic/claude-sonnet-4.6' },
  [PROMPT_KEYS.postCopy]: { system: POST_COPY_SYSTEM, model: 'openai/gpt-5.6-luna' },
}

/** `systemOverride` is a skill's `content`, or undefined. Nothing else can vary. */
export function resolvePrompt(key: PromptKey, systemOverride?: string) {
  const base = PROMPT_REGISTRY[key]
  return {
    model: base.model,
    system: systemOverride?.trim() || base.system,
  }
}
