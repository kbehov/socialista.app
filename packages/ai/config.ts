import {
  REGISTRY_PROMPT_KEYS,
  SLIDESHOW_PLAN_CREDIT_COST,
  type RegistryPromptKey,
} from '@socialista/types'

export const AI_PROMPT_MODELS: Record<RegistryPromptKey, string> = {
  [REGISTRY_PROMPT_KEYS.imagePrompt]: 'openai/gpt-6-sol',
  [REGISTRY_PROMPT_KEYS.influencerPrompt]: 'openai/gpt-6-sol',
  [REGISTRY_PROMPT_KEYS.videoPrompt]: 'openai/gpt-6-sol',
  [REGISTRY_PROMPT_KEYS.influencerHookVideo]: 'openai/gpt-6-sol',
  [REGISTRY_PROMPT_KEYS.staticAd]: 'openai/gpt-6-sol',
  [REGISTRY_PROMPT_KEYS.staticAdTemplateAnalysis]: 'openai/gpt-6-sol',
  [REGISTRY_PROMPT_KEYS.staticAdRecreateCritique]: 'openai/gpt-6-sol',
  [REGISTRY_PROMPT_KEYS.ugcAdPlan]: 'openai/gpt-6-sol',
  [REGISTRY_PROMPT_KEYS.videoScript]: 'openai/gpt-6-sol',
  [REGISTRY_PROMPT_KEYS.slideshow]: 'openai/gpt-6-sol',
  [REGISTRY_PROMPT_KEYS.postCopy]: 'openai/gpt-6-sol',
}

export const AI_CREDIT_COSTS = {
  slideshowPlan: SLIDESHOW_PLAN_CREDIT_COST,
} as const
