/** Workspace skills replace the default system prompt for one studio tool. */
export const SKILL_TARGETS = {
  imagePrompt: 'image-prompt',
  videoPrompt: 'video-prompt',
  staticAd: 'static-ad',
  videoScript: 'video-script',
  postCopy: 'post-copy',
} as const

export type SkillTarget = (typeof SKILL_TARGETS)[keyof typeof SKILL_TARGETS]

export const SKILL_TARGET_VALUES = Object.values(SKILL_TARGETS) as SkillTarget[]

/** @deprecated Use SKILL_TARGETS — kept for call sites that name prompt keys. */
export const PROMPT_KEYS = SKILL_TARGETS

/** @deprecated Use SkillTarget */
export type PromptKey = SkillTarget

/** @deprecated Use SKILL_TARGET_VALUES */
export const PROMPT_KEY_VALUES = SKILL_TARGET_VALUES

export const SKILL_TARGET_LABELS: Record<SkillTarget, string> = {
  'image-prompt': 'Image generation',
  'video-prompt': 'Video generation',
  'static-ad': 'Static ads',
  'video-script': 'Video script',
  'post-copy': 'Post copywriting',
}

/** @deprecated Use SKILL_TARGET_LABELS */
export const PROMPT_KEY_LABELS = SKILL_TARGET_LABELS

/** Default system prompts that are not user-overridable via workspace skills. */
export const REGISTRY_PROMPT_KEYS = {
  ...SKILL_TARGETS,
  slideshow: 'slideshow',
  influencerPrompt: 'influencer-prompt',
  influencerHookVideo: 'influencer-hook-video',
  ugcAdPlan: 'ugc-ad-plan',
} as const

export type RegistryPromptKey = (typeof REGISTRY_PROMPT_KEYS)[keyof typeof REGISTRY_PROMPT_KEYS]

/** Maps removed skill targets to the unified set (for data migration). */
export const LEGACY_SKILL_TARGET_MAP: Record<string, SkillTarget> = {
  'influencer-prompt': SKILL_TARGETS.imagePrompt,
  'influencer-hook-video': SKILL_TARGETS.videoPrompt,
  'ugc-still-prompt': SKILL_TARGETS.imagePrompt,
  'ugc-video-planner': SKILL_TARGETS.videoPrompt,
  'ugc-ad-script': SKILL_TARGETS.videoScript,
  'ugc-ad-plan': SKILL_TARGETS.videoScript,
  slideshow: SKILL_TARGETS.postCopy,
}

export function normalizeSkillTarget(value: string): SkillTarget | null {
  if ((SKILL_TARGET_VALUES as readonly string[]).includes(value)) {
    return value as SkillTarget
  }
  return LEGACY_SKILL_TARGET_MAP[value] ?? null
}

/** Hard cap for skill instruction markdown. Dense system prompts fit; 10k-word dumps do not. */
export const SKILL_CONTENT_MAX_WORDS = 2000

const WHITESPACE = /\s+/

export function countWords(text: string): number {
  const trimmed = text.trim()
  if (!trimmed) return 0
  return trimmed.split(WHITESPACE).length
}

export type Skill = {
  _id: string
  workspaceId: string
  slug: string
  name: string
  description: string
  icon?: string
  target: SkillTarget
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
  target: SkillTarget
  content: string
}

export type UpdateSkillPayload = {
  name?: string
  slug?: string
  description?: string
  icon?: string | null
  target?: SkillTarget
  content?: string
}

export type GetSkillsResponse = {
  skills: Skill[]
}

export type GetSkillResponse = {
  skill: Skill
}
