export type SkillBinding = 'image' | 'video' | 'text'

export const SKILL_BINDINGS = {
  image: 'image',
  video: 'video',
  text: 'text',
} as const satisfies Record<string, SkillBinding>

export const SKILL_BINDING_VALUES = Object.values(SKILL_BINDINGS) as SkillBinding[]

/** Call-site keys for default skills the user cannot pick. Code resolves by slot. */
export const SKILL_SLOTS = {
  imagePromptEnhance: 'image-prompt-enhance',
  videoPromptEnhance: 'video-prompt-enhance',
  staticAdVision: 'static-ad-vision',
  ugcVideoPlanner: 'ugc-video-planner',
  ugcAdScript: 'ugc-ad-script',
  ugcSceneStill: 'ugc-scene-still',
  videoScript: 'video-script',
  slideshow: 'slideshow',
  postCopywriter: 'post-copywriter',
} as const

export type SkillSlot = (typeof SKILL_SLOTS)[keyof typeof SKILL_SLOTS]

export const SKILL_SLOT_VALUES = Object.values(SKILL_SLOTS) as SkillSlot[]

/** Seed slugs for built-in categories. New categories are documents, not this list. */
export const SYSTEM_CATEGORY_SLUGS = {
  productEcommerce: 'product-ecommerce',
  socialAds: 'social-ads',
  brandIdentity: 'brand-identity',
  influencerPersona: 'influencer-persona',
  seasonalCampaign: 'seasonal-campaign',
  editorialContent: 'editorial-content',
  restyleEnhancement: 'restyle-enhancement',
} as const

export type SystemCategorySlug = (typeof SYSTEM_CATEGORY_SLUGS)[keyof typeof SYSTEM_CATEGORY_SLUGS]

export type SkillSource = 'system' | 'user' | 'forked'

export type SkillVisibility = 'private' | 'workspace' | 'public'

export type SkillStatus = 'draft' | 'published' | 'archived'

export type SkillCategoryStatus = 'active' | 'archived'

export type SkillVariableType = 'text' | 'number' | 'select' | 'boolean'

export const SKILL_SOURCES = ['system', 'user', 'forked'] as const satisfies readonly SkillSource[]

export const SKILL_VISIBILITIES = ['private', 'workspace', 'public'] as const satisfies readonly SkillVisibility[]

export const SKILL_STATUSES = ['draft', 'published', 'archived'] as const satisfies readonly SkillStatus[]

export const SKILL_CATEGORY_STATUSES = ['active', 'archived'] as const satisfies readonly SkillCategoryStatus[]

export const SKILL_VARIABLE_TYPES = [
  'text',
  'number',
  'select',
  'boolean',
] as const satisfies readonly SkillVariableType[]

export type SkillVariableValue = string | number | boolean

export type SkillVariable = {
  key: string
  label: string
  description?: string
  type: SkillVariableType
  required: boolean
  defaultValue?: SkillVariableValue
  options?: string[]
}

export type SkillModelConfig = {
  model?: string
  temperature?: number
  maxTokens?: number
}

export type SkillCategory = {
  _id: string
  workspaceId: string | null
  slug: string
  name: string
  description: string
  icon?: string
  sortOrder: number
  source: 'system' | 'user'
  status: SkillCategoryStatus
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

export type SkillCategorySummary = {
  _id: string
  slug: string
  name: string
  icon?: string
}

export type Skill = {
  _id: string
  workspaceId: string | null
  slug: string
  name: string
  description: string
  categoryId: string
  category?: SkillCategorySummary
  binding: SkillBinding
  slot?: SkillSlot
  icon?: string
  content: string
  variables: SkillVariable[]
  outputSchema?: Record<string, unknown>
  toolBindings?: string[]
  modelConfig?: SkillModelConfig
  source: SkillSource
  forkedFrom?: string
  visibility: SkillVisibility
  status: SkillStatus
  version: number
  usageCount: number
  createdBy?: string
  createdAt: Date
  updatedAt: Date
}

export type CreateSkillCategoryPayload = {
  workspaceId: string
  name: string
  slug?: string
  description?: string
  icon?: string
  sortOrder?: number
}

export type UpdateSkillCategoryPayload = {
  name?: string
  slug?: string
  description?: string
  icon?: string | null
  sortOrder?: number
  status?: SkillCategoryStatus
}

export type GetSkillCategoriesResponse = {
  categories: SkillCategory[]
}

export type GetSkillCategoryResponse = {
  category: SkillCategory
}

export type CreateSkillPayload = {
  workspaceId: string
  name: string
  slug?: string
  description?: string
  categoryId: string
  binding: SkillBinding
  slot?: SkillSlot
  icon?: string
  content: string
  variables?: SkillVariable[]
  outputSchema?: Record<string, unknown>
  toolBindings?: string[]
  modelConfig?: SkillModelConfig
  visibility?: SkillVisibility
  status?: SkillStatus
}

export type UpdateSkillPayload = {
  name?: string
  slug?: string
  description?: string
  categoryId?: string
  binding?: SkillBinding
  slot?: SkillSlot | null
  icon?: string | null
  content?: string
  variables?: SkillVariable[]
  outputSchema?: Record<string, unknown> | null
  toolBindings?: string[] | null
  modelConfig?: SkillModelConfig | null
  visibility?: SkillVisibility
  status?: SkillStatus
}

export type ForkSkillPayload = {
  workspaceId: string
  name?: string
  slug?: string
}

export type GetSkillsResponse = {
  skills: Skill[]
}

export type GetSkillResponse = {
  skill: Skill
}

export type ResolveSkillQuery = {
  workspaceId: string
  slot?: SkillSlot
  skillId?: string
  variables?: Record<string, SkillVariableValue>
}

export type ResolveSkillResponse = {
  skillId?: string
  slug?: string
  binding?: SkillBinding
  slot?: SkillSlot
  content: string
  modelConfig?: SkillModelConfig
  source: SkillSource | 'fallback'
}

export type SystemCategoryDefinition = {
  slug: string
  name: string
  description: string
  icon?: string
  sortOrder?: number
}

/** Seed / sync payload for system skills (no Mongo ids). */
export type SystemSkillDefinition = {
  slug: string
  name: string
  description: string
  categorySlug: string
  binding: SkillBinding
  slot?: SkillSlot
  content: string
  icon?: string
  variables?: SkillVariable[]
  outputSchema?: Record<string, unknown>
  toolBindings?: string[]
  modelConfig?: SkillModelConfig
}
