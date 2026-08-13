export const UGC_PROJECT_STATUSES = ['draft', 'generating', 'ready', 'failed'] as const
export type UgcProjectStatus = (typeof UGC_PROJECT_STATUSES)[number]

export const UGC_CLIP_STATUSES = ['idle', 'queued', 'generating', 'ready', 'failed'] as const
export type UgcClipStatus = (typeof UGC_CLIP_STATUSES)[number]

/** @deprecated Use UgcClipStatus. Kept for older variant-shaped documents. */
export const UGC_VARIANT_STATUSES = UGC_CLIP_STATUSES
export type UgcVariantStatus = UgcClipStatus

export const UGC_SCRIPT_SOURCES = ['user', 'ai'] as const
export type UgcScriptSource = (typeof UGC_SCRIPT_SOURCES)[number]

export const UGC_CLIP_TYPES = [
  'talking',
  'b-roll',
  'unboxing',
  'try-on',
  'product-hold',
  'app-showcase',
] as const
export type UgcClipType = (typeof UGC_CLIP_TYPES)[number]

export const UGC_SCENE_COUNTS = [1, 2, 3] as const
export type UgcSceneCount = (typeof UGC_SCENE_COUNTS)[number]

export const UGC_MAX_VARIANTS = 3
export const UGC_MAX_SCENES = 3
export const UGC_MAX_CLIPS = 12
export const UGC_DEFAULT_SCENE_COUNT: UgcSceneCount = 2
export const UGC_DEFAULT_ASPECT_RATIO = '9:16' as const
export const UGC_DURATION_MIN = 5
export const UGC_DURATION_MAX = 15
export const UGC_DEFAULT_DURATION = 8
export const UGC_SCRIPT_MAX_CHARS = 150

export const UGC_CLIP_DEFAULT_SCENE_COUNT: Record<UgcClipType, UgcSceneCount> = {
  talking: 1,
  'b-roll': 1,
  unboxing: 2,
  'try-on': 1,
  'product-hold': 2,
  'app-showcase': 1,
}

export const UGC_CLIP_TYPE_LABELS: Record<UgcClipType, string> = {
  talking: 'Talking',
  'b-roll': 'Product b-roll',
  unboxing: 'Unboxing',
  'try-on': 'Try-on',
  'product-hold': 'Product hold',
  'app-showcase': 'App showcase',
}

export const UGC_CLIP_TYPE_DESCRIPTIONS: Record<UgcClipType, string> = {
  talking: 'Creator talks to camera',
  'b-roll': 'Product-only beauty shots',
  unboxing: 'Open the box on camera',
  'try-on': 'Wear or use the product',
  'product-hold': 'Hold and present the SKU',
  'app-showcase': 'Show the app on a phone',
}

const CREATOR_REQUIRED = new Set<UgcClipType>(['talking', 'unboxing', 'try-on', 'product-hold'])
const SCRIPT_VISIBLE = new Set<UgcClipType>(['talking', 'product-hold', 'unboxing', 'try-on', 'app-showcase'])
const SCRIPT_REQUIRED = new Set<UgcClipType>(['talking'])
const PRODUCT_REQUIRED = new Set<UgcClipType>(['product-hold', 'b-roll', 'unboxing', 'try-on'])
const SCREENSHOTS_REQUIRED = new Set<UgcClipType>(['app-showcase'])

export function ugcClipRequiresCreator(type: UgcClipType): boolean {
  return CREATOR_REQUIRED.has(type)
}

export function ugcClipShowsScript(type: UgcClipType): boolean {
  return SCRIPT_VISIBLE.has(type)
}

export function ugcClipRequiresScript(type: UgcClipType): boolean {
  return SCRIPT_REQUIRED.has(type)
}

export function ugcClipRequiresProduct(type: UgcClipType): boolean {
  return PRODUCT_REQUIRED.has(type)
}

export function ugcClipRequiresScreenshots(type: UgcClipType): boolean {
  return SCREENSHOTS_REQUIRED.has(type)
}

export function ugcScriptTargetChars(durationSec: number): number {
  const clamped = Math.min(UGC_DURATION_MAX, Math.max(UGC_DURATION_MIN, durationSec))
  return Math.round(50 + ((clamped - UGC_DURATION_MIN) / (UGC_DURATION_MAX - UGC_DURATION_MIN)) * 100)
}

export function clampUgcDuration(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return UGC_DEFAULT_DURATION
  return Math.min(UGC_DURATION_MAX, Math.max(UGC_DURATION_MIN, Math.round(n)))
}

export function clampUgcScript(text: string): string {
  return text.slice(0, UGC_SCRIPT_MAX_CHARS)
}

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
  enhancedPrompt?: string
}

export type UgcClip = {
  id: string
  type: UgcClipType
  name?: string
  status: UgcClipStatus
  durationSec: number
  influencerId?: string
  script?: UgcProjectScript
  scenePrompt?: string
  directions?: string
  referenceImageUrls?: string[]
  stills: UgcSceneStill[]
  plannedPrompt?: string
  negativePrompt?: string
  videoUrl?: string
  thumbnailUrl?: string
  generationId?: string
  composedVideoId?: string
  stillsRunId?: string
  videoRunId?: string
  error?: string
}

/** @deprecated Older influencer-variant shape. Prefer UgcClip. */
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
  aspectRatio: string
  models: UgcProjectModels
  clips: UgcClip[]
  error?: string
  createdAt: Date
  updatedAt: Date
}

export type UgcProjectSummary = Pick<
  UgcProject,
  'id' | 'name' | 'status' | 'workspaceId' | 'productImageUrls' | 'createdAt' | 'updatedAt'
> & {
  clipCount: number
  readyCount: number
  previewImageUrl?: string
}

export type CreateUgcProjectPayload = {
  workspaceId: string
  name?: string
  productId?: string
  productImageUrls?: string[]
  productName?: string
  aspectRatio?: string
  models?: Partial<UgcProjectModels>
}

export type UpdateUgcProjectPayload = {
  name?: string
  productId?: string | null
  productImageUrls?: string[]
  productName?: string
  aspectRatio?: string
  models?: Partial<UgcProjectModels>
}

export type CreateUgcClipPayload = {
  type: UgcClipType
  durationSec?: number
  influencerId?: string
  name?: string
}

export type UpdateUgcClipPayload = {
  name?: string
  durationSec?: number
  influencerId?: string | null
  script?: Partial<UgcProjectScript>
  scenePrompt?: string | null
  directions?: string | null
  referenceImageUrls?: string[]
  plannedPrompt?: string | null
}

export type GenerateUgcStillsPayload = {
  clipId: string
  stillIndex?: number
  skipEnhance?: boolean
}

export type GenerateUgcVideosPayload = {
  clipId: string
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
