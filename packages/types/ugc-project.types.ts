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

export const UGC_DEFAULT_CLIP_TYPE: UgcClipType = 'product-hold'

export const UGC_CLIP_TYPE_LABELS: Record<UgcClipType, string> = {
  talking: 'Talking to camera',
  'b-roll': 'Product b-roll',
  unboxing: 'Unboxing',
  'try-on': 'Try-on',
  'product-hold': 'Holding the product',
  'app-showcase': 'App on screen',
}

export const UGC_CLIP_TYPE_DESCRIPTIONS: Record<UgcClipType, string> = {
  talking: 'Hook or CTA — they speak to the phone',
  'b-roll': 'Beauty shots of the product, no talking',
  unboxing: 'Open the box on camera',
  'try-on': 'Wear or use the product',
  'product-hold': 'Hold the SKU and talk to camera',
  'app-showcase': 'Show the app on a phone',
}

export const UGC_VOICE_PROVIDERS = ['elevenlabs'] as const
export type UgcVoiceProvider = (typeof UGC_VOICE_PROVIDERS)[number]

export const UGC_CLIP_STORYBOARD_STATUSES = ['setup', 'photos', 'script', 'ready', 'generating'] as const
export type UgcClipStoryboardStatus = (typeof UGC_CLIP_STORYBOARD_STATUSES)[number]

export const UGC_CLIP_STORYBOARD_LABELS: Record<UgcClipStoryboardStatus, string> = {
  setup: 'Setup',
  photos: 'Photos',
  script: 'Script',
  ready: 'Ready',
  generating: 'Generating',
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

export function clampUgcSceneCount(
  value: unknown,
  fallback: UgcSceneCount = UGC_DEFAULT_SCENE_COUNT,
): UgcSceneCount {
  if (value === 1 || value === 2 || value === 3) return value
  const n = Number(value)
  if (n === 1 || n === 2 || n === 3) return n
  return fallback
}

export function ugcResolvedInfluencerId(
  project: { influencerId?: string },
  clip?: { influencerId?: string },
): string | undefined {
  return clip?.influencerId ?? project.influencerId
}

export function ugcClipSceneCount(clip: {
  type: UgcClipType
  stills: { index: number }[]
  sceneCount?: number
}): UgcSceneCount {
  return clampUgcSceneCount(clip.sceneCount ?? clip.stills.length, UGC_CLIP_DEFAULT_SCENE_COUNT[clip.type])
}

export function resizeUgcStills(stills: UgcSceneStill[], sceneCount: UgcSceneCount): UgcSceneStill[] {
  const next = stills.slice(0, sceneCount).map((still, index) => ({ ...still, index }))
  while (next.length < sceneCount) {
    next.push({ index: next.length })
  }
  return next
}

export function moveUgcStillToStart(stills: UgcSceneStill[], startFrameIndex: number): UgcSceneStill[] {
  if (startFrameIndex <= 0 || startFrameIndex >= stills.length) {
    return stills.map((still, index) => ({ ...still, index }))
  }
  const next = [...stills]
  const [picked] = next.splice(startFrameIndex, 1)
  if (!picked) return stills.map((still, index) => ({ ...still, index }))
  next.unshift(picked)
  return next.map((still, index) => ({ ...still, index }))
}

export function ugcClipStoryboardStatus(
  project: { productImageUrls: string[]; influencerId?: string },
  clip: UgcClip,
): UgcClipStoryboardStatus {
  if (clip.status === 'generating') return 'generating'
  if (clip.videoUrl) return 'ready'
  if (ugcClipRequiresProduct(clip.type) && project.productImageUrls.length === 0) return 'setup'
  if (ugcClipRequiresCreator(clip.type) && !ugcResolvedInfluencerId(project, clip)) return 'setup'
  if (ugcClipRequiresScreenshots(clip.type) && (clip.referenceImageUrls?.length ?? 0) === 0) return 'setup'
  if (!clip.stills.some(still => still.imageUrl)) return 'photos'
  return 'script'
}

export type UgcProjectModels = {
  image: string
  script?: string
  video: string
  planner?: string
}

export type UgcClipModels = {
  image?: string
  script?: string
  video?: string
  planner?: string
}

export function ugcResolvedClipModels(
  project: { models: UgcProjectModels },
  clip?: { models?: UgcClipModels },
): UgcProjectModels {
  return {
    image: clip?.models?.image ?? project.models.image,
    video: clip?.models?.video ?? project.models.video,
    ...(clip?.models?.script ?? project.models.script
      ? { script: clip?.models?.script ?? project.models.script }
      : {}),
    ...(clip?.models?.planner ?? project.models.planner
      ? { planner: clip?.models?.planner ?? project.models.planner }
      : {}),
  }
}

export type UgcProjectScript = {
  text: string
  source: UgcScriptSource
}

export type UgcClipVoice = {
  provider: UgcVoiceProvider
  voiceId?: string
  voiceName?: string
  speed?: number
  stability?: number
  enabled?: boolean
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
  sceneCount: UgcSceneCount
  influencerId?: string
  script?: UgcProjectScript
  voice?: UgcClipVoice
  models?: UgcClipModels
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
  imageAdUrl?: string
  imageAdGenerationId?: string
  imageAdRunId?: string
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
  influencerId?: string
  aspectRatio: string
  models: UgcProjectModels
  clips: UgcClip[]
  assembledVideoUrl?: string
  assembledGenerationId?: string
  assembledRunId?: string
  composedProjectVideoId?: string
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
  influencerId?: string
  aspectRatio?: string
  models?: Partial<UgcProjectModels>
}

export type UpdateUgcProjectPayload = {
  name?: string
  productId?: string | null
  productImageUrls?: string[]
  productName?: string
  influencerId?: string | null
  aspectRatio?: string
  models?: Partial<UgcProjectModels>
  clipOrder?: string[]
}

export type CreateUgcClipPayload = {
  type?: UgcClipType
  durationSec?: number
  sceneCount?: UgcSceneCount
  influencerId?: string
  name?: string
}

export type UpdateUgcClipPayload = {
  name?: string
  type?: UgcClipType
  durationSec?: number
  sceneCount?: UgcSceneCount
  startFrameIndex?: number
  influencerId?: string | null
  script?: Partial<UgcProjectScript>
  voice?: UgcClipVoice | null
  scenePrompt?: string | null
  directions?: string | null
  referenceImageUrls?: string[]
  plannedPrompt?: string | null
  models?: Partial<UgcClipModels>
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

export type GenerateUgcImageAdPayload = {
  clipId: string
  prompt?: string
  language?: string
  aspectRatio?: string
  productImage?: string
}

export type AssembleUgcProjectResponse = UgcGenerationHandle

export type GetUgcProjectsResponse = {
  projects: UgcProjectSummary[]
}

export type UgcGenerationHandle = {
  project: UgcProject
  runId: string
  publicAccessToken: string
}
