export const UGC_PROJECT_STATUSES = ['draft', 'generating', 'ready', 'failed'] as const
export type UgcProjectStatus = (typeof UGC_PROJECT_STATUSES)[number]

export const UGC_VARIANT_STATUSES = ['idle', 'queued', 'generating', 'ready', 'failed'] as const
export type UgcVariantStatus = (typeof UGC_VARIANT_STATUSES)[number]

export const UGC_SCRIPT_SOURCES = ['user', 'ai'] as const
export type UgcScriptSource = (typeof UGC_SCRIPT_SOURCES)[number]

export const UGC_SCENE_COUNTS = [1, 2, 3] as const
export type UgcSceneCount = (typeof UGC_SCENE_COUNTS)[number]

export const UGC_MAX_VARIANTS = 3
export const UGC_MAX_SCENES = 3
export const UGC_DEFAULT_SCENE_COUNT: UgcSceneCount = 2
export const UGC_DEFAULT_ASPECT_RATIO = '9:16' as const

export type UgcProjectModels = {
  image: string
  script?: string
  video: string
  planner?: string
}

export type UgcProjectScript = {
  text: string
  source: UgcScriptSource
}

export type UgcSceneStill = {
  index: number
  imageUrl?: string
  generationId?: string
}

export type UgcVariant = {
  id: string
  influencerId: string
  status: UgcVariantStatus
  stills: UgcSceneStill[]
  plannedPrompt?: string
  negativePrompt?: string
  videoUrl?: string
  thumbnailUrl?: string
  generationId?: string
  composedVideoId?: string
  error?: string
}

export type UgcProject = {
  id: string
  name: string
  status: UgcProjectStatus
  workspaceId: string
  createdBy: string
  productId?: string
  productImageUrls: string[]
  productName?: string
  influencerIds: string[]
  sceneCount: UgcSceneCount
  aspectRatio: string
  models: UgcProjectModels
  script: UgcProjectScript
  directions?: string
  variants: UgcVariant[]
  stillsRunId?: string
  videoRunId?: string
  error?: string
  createdAt: Date
  updatedAt: Date
}

export type UgcProjectSummary = Pick<
  UgcProject,
  'id' | 'name' | 'status' | 'workspaceId' | 'productImageUrls' | 'influencerIds' | 'sceneCount' | 'createdAt' | 'updatedAt'
> & {
  variantCount: number
  readyCount: number
  previewImageUrl?: string
}

export type CreateUgcProjectPayload = {
  workspaceId: string
  name?: string
  productId?: string
  productImageUrls?: string[]
  productName?: string
  influencerIds?: string[]
  sceneCount?: UgcSceneCount
  aspectRatio?: string
  models?: Partial<UgcProjectModels>
  script?: Partial<UgcProjectScript>
  directions?: string
}

export type UpdateUgcProjectPayload = {
  name?: string
  productId?: string | null
  productImageUrls?: string[]
  productName?: string
  influencerIds?: string[]
  sceneCount?: UgcSceneCount
  aspectRatio?: string
  models?: Partial<UgcProjectModels>
  script?: Partial<UgcProjectScript>
  directions?: string | null
  variants?: UgcVariant[]
}

export type GenerateUgcStillsPayload = {
  variantIds?: string[]
}

export type GenerateUgcVideosPayload = {
  variantIds?: string[]
  plannedPrompt?: string
  skipPlanner?: boolean
}

export type OpenUgcEditorResponse = {
  videoId: string
}

export type GenerateUgcScriptPayload = {
  model?: string
}

export type GetUgcProjectsResponse = {
  projects: UgcProjectSummary[]
}

export type UgcGenerationHandle = {
  project: UgcProject
  runId: string
  publicAccessToken: string
}
