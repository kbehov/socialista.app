export const PROMPT_KEYS = {
  imagePrompt: 'image-prompt',
  influencerPrompt: 'influencer-prompt',
  videoPrompt: 'video-prompt',
  influencerHookVideo: 'influencer-hook-video',
  staticAd: 'static-ad',
  ugcVideoPlanner: 'ugc-video-planner',
  ugcAdScript: 'ugc-ad-script',
  ugcAdPlan: 'ugc-ad-plan',
  videoScript: 'video-script',
  slideshow: 'slideshow',
  postCopy: 'post-copy',
} as const

export type PromptKey = (typeof PROMPT_KEYS)[keyof typeof PROMPT_KEYS]

export const PROMPT_KEY_VALUES = Object.values(PROMPT_KEYS) as PromptKey[]

/** Hard cap for skill instruction markdown. Dense system prompts fit; 10k-word dumps do not. */
export const SKILL_CONTENT_MAX_WORDS = 2000

const WHITESPACE = /\s+/

export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(WHITESPACE).length
}

export const PROMPT_KEY_LABELS: Record<PromptKey, string> = {
  'image-prompt': 'Image generation',
  'influencer-prompt': 'Influencer UGC',
  'video-prompt': 'Video generation',
  'influencer-hook-video': 'Influencer hook video',
  'static-ad': 'Static ads',
  'ugc-video-planner': 'UGC planner',
  'ugc-ad-script': 'UGC script',
  'ugc-ad-plan': 'UGC ad plan',
  'video-script': 'Video script',
  slideshow: 'Slideshow',
  'post-copy': 'Post copy',
}

export type Skill = {
  _id: string
  workspaceId: string
  slug: string
  name: string
  description: string
  icon?: string
  target: PromptKey
  content: string
  usageCount: number
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

export type CreateSkillPayload = {
  workspaceId: string
  name: string
  slug?: string
  description?: string
  icon?: string
  target: PromptKey
  content: string
}

export type UpdateSkillPayload = {
  name?: string
  slug?: string
  description?: string
  icon?: string | null
  target?: PromptKey
  content?: string
}

export type GetSkillsResponse = {
  skills: Skill[]
}

export type GetSkillResponse = {
  skill: Skill
}
