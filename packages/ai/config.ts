import { PROMPT_KEYS, SLIDESHOW_PLAN_CREDIT_COST, type PromptKey } from '@socialista/types'

export const AI_PROMPT_MODELS: Record<PromptKey, string> = {
  [PROMPT_KEYS.imagePrompt]: 'openai/gpt-6-sol',
  [PROMPT_KEYS.influencerPrompt]: 'openai/gpt-6-sol',
  [PROMPT_KEYS.videoPrompt]: 'openai/gpt-6-sol',
  [PROMPT_KEYS.influencerHookVideo]: 'openai/gpt-6-sol',
  [PROMPT_KEYS.staticAd]: 'openai/gpt-6-sol',
  [PROMPT_KEYS.ugcStillPrompt]: 'openai/gpt-6-sol',
  [PROMPT_KEYS.ugcVideoPlanner]: 'openai/gpt-6-sol',
  [PROMPT_KEYS.ugcAdScript]: 'openai/gpt-6-sol',
  [PROMPT_KEYS.ugcAdPlan]: 'openai/gpt-6-sol',
  [PROMPT_KEYS.videoScript]: 'openai/gpt-6-sol',
  [PROMPT_KEYS.slideshow]: 'openai/gpt-6-sol',
  [PROMPT_KEYS.postCopy]: 'openai/gpt-6-sol',
}

export const AI_CREDIT_COSTS = {
  slideshowPlan: SLIDESHOW_PLAN_CREDIT_COST,
} as const
