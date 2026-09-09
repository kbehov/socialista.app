import { PROMPT_KEYS, SLIDESHOW_PLAN_CREDIT_COST, type PromptKey } from '@socialista/types'

export const AI_PROMPT_MODELS: Record<PromptKey, string> = {
  [PROMPT_KEYS.imagePrompt]: 'openai/gpt-5.6-terra',
  [PROMPT_KEYS.videoPrompt]: 'openai/gpt-5.6-terra',
  [PROMPT_KEYS.staticAd]: 'openai/gpt-5.6-sol',
  [PROMPT_KEYS.ugcVideoPlanner]: 'openai/gpt-5.6-terra',
  [PROMPT_KEYS.ugcAdScript]: 'openai/gpt-5.6-luna',
  [PROMPT_KEYS.videoScript]: 'anthropic/claude-sonnet-4.6',
  [PROMPT_KEYS.slideshow]: 'anthropic/claude-sonnet-4.6',
  [PROMPT_KEYS.postCopy]: 'openai/gpt-5.6-luna',
}

export const AI_CREDIT_COSTS = {
  slideshowPlan: SLIDESHOW_PLAN_CREDIT_COST,
} as const
