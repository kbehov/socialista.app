import { REGISTRY_PROMPT_KEYS, type RegistryPromptKey } from '@socialista/types'

import { AI_PROMPT_MODELS } from './config.js'
import { POST_COPY_SYSTEM } from './prompts/post-copy.js'
import { IMAGE_PROMPT_SYSTEM } from './prompts/image.js'
import { INFLUENCER_PROMPT_SYSTEM } from './prompts/influencer.js'
import { SLIDESHOW_SYSTEM } from './prompts/slideshow.js'
import { STATIC_AD_RECREATE_CRITIQUE_SYSTEM } from './prompts/static-ad-recreate-critique.js'
import { STATIC_AD_TEMPLATE_ANALYSIS_SYSTEM } from './prompts/static-ad-template-analysis.js'
import { STATIC_AD_VISION_SYSTEM } from './prompts/static-ad.js'
import { UGC_AD_PLAN_SYSTEM } from './prompts/ugc-ad-plan.js'
import { VIDEO_PROMPT_SYSTEM } from './prompts/video.js'
import { INFLUENCER_HOOK_VIDEO_PROMPT_SYSTEM } from './prompts/influencer-hook-video.js'
import { VIDEO_SCRIPT_SYSTEM } from './prompts/video-script.js'

type PromptDefinition = { system: string; model: string }

export const PROMPT_REGISTRY: Record<RegistryPromptKey, PromptDefinition> = {
  [REGISTRY_PROMPT_KEYS.imagePrompt]: {
    system: IMAGE_PROMPT_SYSTEM,
    model: AI_PROMPT_MODELS[REGISTRY_PROMPT_KEYS.imagePrompt],
  },
  [REGISTRY_PROMPT_KEYS.influencerPrompt]: {
    system: INFLUENCER_PROMPT_SYSTEM,
    model: AI_PROMPT_MODELS[REGISTRY_PROMPT_KEYS.influencerPrompt],
  },
  [REGISTRY_PROMPT_KEYS.videoPrompt]: {
    system: VIDEO_PROMPT_SYSTEM,
    model: AI_PROMPT_MODELS[REGISTRY_PROMPT_KEYS.videoPrompt],
  },
  [REGISTRY_PROMPT_KEYS.influencerHookVideo]: {
    system: INFLUENCER_HOOK_VIDEO_PROMPT_SYSTEM,
    model: AI_PROMPT_MODELS[REGISTRY_PROMPT_KEYS.influencerHookVideo],
  },
  [REGISTRY_PROMPT_KEYS.staticAd]: {
    system: STATIC_AD_VISION_SYSTEM,
    model: AI_PROMPT_MODELS[REGISTRY_PROMPT_KEYS.staticAd],
  },
  [REGISTRY_PROMPT_KEYS.staticAdTemplateAnalysis]: {
    system: STATIC_AD_TEMPLATE_ANALYSIS_SYSTEM,
    model: AI_PROMPT_MODELS[REGISTRY_PROMPT_KEYS.staticAdTemplateAnalysis],
  },
  [REGISTRY_PROMPT_KEYS.staticAdRecreateCritique]: {
    system: STATIC_AD_RECREATE_CRITIQUE_SYSTEM,
    model: AI_PROMPT_MODELS[REGISTRY_PROMPT_KEYS.staticAdRecreateCritique],
  },
  [REGISTRY_PROMPT_KEYS.ugcAdPlan]: {
    system: UGC_AD_PLAN_SYSTEM,
    model: AI_PROMPT_MODELS[REGISTRY_PROMPT_KEYS.ugcAdPlan],
  },
  [REGISTRY_PROMPT_KEYS.videoScript]: {
    system: VIDEO_SCRIPT_SYSTEM,
    model: AI_PROMPT_MODELS[REGISTRY_PROMPT_KEYS.videoScript],
  },
  [REGISTRY_PROMPT_KEYS.slideshow]: {
    system: SLIDESHOW_SYSTEM,
    model: AI_PROMPT_MODELS[REGISTRY_PROMPT_KEYS.slideshow],
  },
  [REGISTRY_PROMPT_KEYS.postCopy]: {
    system: POST_COPY_SYSTEM,
    model: AI_PROMPT_MODELS[REGISTRY_PROMPT_KEYS.postCopy],
  },
}

/** `systemOverride` is a skill's `content`, or undefined. Nothing else can vary. */
export function resolvePrompt(key: RegistryPromptKey, systemOverride?: string) {
  const base = PROMPT_REGISTRY[key]
  return {
    model: base.model,
    system: systemOverride?.trim() || base.system,
  }
}
