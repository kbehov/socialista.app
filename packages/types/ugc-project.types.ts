import type { VideoResolution } from './video-generation.types.js'

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
  'hook',
  'talking',
  'b-roll',
  'unboxing',
  'try-on',
  'product-hold',
  'app-showcase',
] as const
export type UgcClipType = (typeof UGC_CLIP_TYPES)[number]

export const UGC_PRODUCT_KINDS = ['physical', 'app', 'website'] as const
export type UgcProductKind = (typeof UGC_PRODUCT_KINDS)[number]

export const UGC_FLOW_STEPS = [
  'product',
  'scenes',
  'avatar',
  'script',
  'stills',
  'review',
  'video',
] as const
export type UgcFlowStep = (typeof UGC_FLOW_STEPS)[number]

export const UGC_SCENE_COUNTS = [1, 2, 3] as const
export type UgcSceneCount = (typeof UGC_SCENE_COUNTS)[number]

export const UGC_MAX_VARIANTS = 3
export const UGC_MAX_SCENES = 3
export const UGC_MAX_CLIPS = 12
export const UGC_MAX_STILL_VERSIONS = 24
export const UGC_MAX_AUDIO_TAKES = 20
export const UGC_DEFAULT_SCENE_COUNT: UgcSceneCount = 1
export const UGC_DEFAULT_ASPECT_RATIO = '9:16' as const
export const UGC_DURATION_MIN = 5
export const UGC_DURATION_MAX = 15
export const UGC_DEFAULT_DURATION = 8
export const UGC_SCRIPT_MAX_CHARS = 150
export const UGC_SPOKEN_CHARS_PER_SEC = 12

export const UGC_CLIP_DEFAULT_SCENE_COUNT: Record<UgcClipType, UgcSceneCount> = {
  hook: 1,
  talking: 1,
  'b-roll': 1,
  unboxing: 1,
  'try-on': 1,
  'product-hold': 1,
  'app-showcase': 1,
}

export const UGC_DEFAULT_CLIP_TYPE: UgcClipType = 'talking'

export const UGC_STARTER_SCENE_TYPES: UgcClipType[] = ['talking', 'product-hold', 'b-roll']
export const UGC_PRIMARY_SCENE_TYPES: UgcClipType[] = ['talking', 'product-hold', 'b-roll']

export const UGC_CLIP_TYPE_LABELS: Record<UgcClipType, string> = {
  hook: 'Text hook',
  talking: 'Talk to camera',
  'b-roll': 'Show the product',
  unboxing: 'Open the box',
  'try-on': 'Wear / use it',
  'product-hold': 'Hold the product',
  'app-showcase': 'Show it on a phone',
}

export const UGC_CLIP_TYPE_DESCRIPTIONS: Record<UgcClipType, string> = {
  hook: 'On-screen hook line — no talking, no voiceover',
  talking: 'They look at the camera and talk',
  'b-roll': 'Just the product — no person talking',
  unboxing: 'They open the package on camera',
  'try-on': 'They wear or use it',
  'product-hold': 'They hold it up and talk about it',
  'app-showcase': 'They show the app on a phone',
}

export const UGC_FLOW_STEP_LABELS: Record<UgcFlowStep, string> = {
  product: 'Product',
  scenes: 'Scenes',
  avatar: 'Creator',
  script: 'Script',
  stills: 'Photos',
  review: 'Review',
  video: 'Render',
}

export const UGC_PRODUCT_KIND_LABELS: Record<UgcProductKind, string> = {
  physical: 'Physical product',
  app: 'App',
  website: 'Website',
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
const SCRIPT_VISIBLE = new Set<UgcClipType>([
  'hook',
  'talking',
  'product-hold',
  'unboxing',
  'try-on',
  'app-showcase',
  'b-roll',
])
const SCRIPT_REQUIRED = new Set<UgcClipType>(['talking', 'hook'])
const PRODUCT_REQUIRED = new Set<UgcClipType>(['product-hold', 'b-roll', 'unboxing', 'try-on'])
const SCREENSHOTS_REQUIRED = new Set<UgcClipType>(['app-showcase'])
const LIP_SYNC_TYPES = new Set<UgcClipType>(['talking', 'product-hold', 'try-on', 'unboxing'])
const ON_SCREEN_TEXT_TYPES = new Set<UgcClipType>(['hook'])

export const UGC_AUDIO_MODES = ['none', 'lip-sync', 'voiceover'] as const
export type UgcAudioMode = (typeof UGC_AUDIO_MODES)[number]

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

export function ugcClipUsesLipSync(type: UgcClipType): boolean {
  return LIP_SYNC_TYPES.has(type)
}

export function ugcClipShowsOnScreenText(type: UgcClipType): boolean {
  return ON_SCREEN_TEXT_TYPES.has(type)
}

export function ugcClipGeneratesAudio(type: UgcClipType): boolean {
  return ugcClipShowsScript(type) && !ugcClipShowsOnScreenText(type)
}

export function ugcClipAudioMode(type: UgcClipType, hasAudio: boolean): UgcAudioMode {
  if (!hasAudio) return 'none'
  return ugcClipUsesLipSync(type) ? 'lip-sync' : 'voiceover'
}

export function ugcScriptTargetChars(durationSec: number): number {
  const spokenWindow = Math.min(10, Math.max(UGC_DURATION_MIN, durationSec))
  return Math.min(UGC_SCRIPT_MAX_CHARS, Math.round(spokenWindow * UGC_SPOKEN_CHARS_PER_SEC))
}

export function clampUgcDuration(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return UGC_DEFAULT_DURATION
  return Math.min(UGC_DURATION_MAX, Math.max(UGC_DURATION_MIN, Math.round(n)))
}

export function clampUgcScript(text: string): string {
  return text.slice(0, UGC_SCRIPT_MAX_CHARS)
}

export function estimateUgcSpokenDurationSec(text: string, speed = 1): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length
  if (words === 0) return 0
  const rate = Math.max(0.7, Math.min(1.2, speed)) * 2.5
  return Math.max(1, Math.round((words / rate) * 10) / 10)
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

/** Defaults tuned for conversational UGC (ElevenLabs 0–100 scale). */
export const UGC_DEFAULT_VOICE: UgcClipVoice = {
  provider: 'elevenlabs',
  voiceId: '21m00Tcm4TlvDq8ikWAM',
  voiceName: 'Rachel',
  speed: 1.05,
  stability: 45,
  similarity: 75,
  style: 15,
  speakerBoost: true,
  enabled: true,
}

export function ugcResolvedClipVoice(
  project: { voice?: UgcClipVoice },
  clip?: { voice?: UgcClipVoice },
): UgcClipVoice {
  return {
    ...UGC_DEFAULT_VOICE,
    ...project.voice,
    ...clip?.voice,
  }
}

export const UGC_CAMPAIGN_PRESET_IDS = [
  'problem-solution',
  'unboxing-review',
  'viral-hook',
  'b-roll-showcase',
] as const
export type UgcCampaignPresetId = (typeof UGC_CAMPAIGN_PRESET_IDS)[number]

export type UgcCampaignPresetBeat = {
  type: UgcClipType
  durationSec: number
  name: string
}

export type UgcCampaignPreset = {
  id: UgcCampaignPresetId
  label: string
  description: string
  beats: UgcCampaignPresetBeat[]
}

export const UGC_CAMPAIGN_PRESETS: UgcCampaignPreset[] = [
  {
    id: 'problem-solution',
    label: 'Problem → Solution',
    description: 'Hook the pain, show the product, close with a CTA.',
    beats: [
      { type: 'talking', durationSec: 6, name: 'Hook' },
      { type: 'product-hold', durationSec: 8, name: 'Demo' },
      { type: 'talking', durationSec: 6, name: 'CTA' },
    ],
  },
  {
    id: 'unboxing-review',
    label: 'Unboxing & Review',
    description: 'Open the box, show details, give a verdict.',
    beats: [
      { type: 'unboxing', durationSec: 8, name: 'Unbox' },
      { type: 'b-roll', durationSec: 6, name: 'Details' },
      { type: 'talking', durationSec: 7, name: 'Verdict' },
    ],
  },
  {
    id: 'viral-hook',
    label: 'Viral Hook',
    description: 'Fast opener, product showcase, punchy ask.',
    beats: [
      { type: 'hook', durationSec: 5, name: 'Hook' },
      { type: 'product-hold', durationSec: 7, name: 'Showcase' },
      { type: 'talking', durationSec: 5, name: 'CTA' },
    ],
  },
  {
    id: 'b-roll-showcase',
    label: 'Product B-roll',
    description: 'Aesthetic product shots with a hold-to-camera close.',
    beats: [
      { type: 'b-roll', durationSec: 6, name: 'B-roll 1' },
      { type: 'b-roll', durationSec: 6, name: 'B-roll 2' },
      { type: 'product-hold', durationSec: 6, name: 'Hold' },
    ],
  },
]

export function parseUgcCampaignPresetId(value: unknown): UgcCampaignPresetId | undefined {
  if (typeof value === 'string' && (UGC_CAMPAIGN_PRESET_IDS as readonly string[]).includes(value)) {
    return value as UgcCampaignPresetId
  }
  return undefined
}

export function parseUgcProductKind(value: unknown): UgcProductKind | undefined {
  if (typeof value === 'string' && (UGC_PRODUCT_KINDS as readonly string[]).includes(value)) {
    return value as UgcProductKind
  }
  return undefined
}

export function parseUgcFlowStep(value: unknown): UgcFlowStep | undefined {
  if (typeof value === 'string' && (UGC_FLOW_STEPS as readonly string[]).includes(value)) {
    return value as UgcFlowStep
  }
  return undefined
}

export function inferUgcProductKind(input: { url?: string; description?: string }): UgcProductKind {
  const url = input.url?.toLowerCase() ?? ''
  const text = `${url} ${input.description ?? ''}`.toLowerCase()
  if (
    url.includes('apps.apple.com') ||
    url.includes('play.google.com') ||
    text.includes(' mobile app') ||
    text.includes('ios app') ||
    text.includes('android app')
  ) {
    return 'app'
  }
  if (url.startsWith('http://') || url.startsWith('https://')) return 'website'
  return 'physical'
}

export function ugcClipSceneCount(_clip?: {
  type: UgcClipType
  stills: { index: number }[]
  sceneCount?: number
}): UgcSceneCount {
  return 1
}

export function resizeUgcStills(stills: UgcSceneStill[], sceneCount: UgcSceneCount): UgcSceneStill[] {
  const next = stills.map((still, index) => ({ ...still, index }))
  while (next.length < sceneCount) {
    next.push({ index: next.length })
  }
  return next
}

export function appendUgcStills(existing: UgcSceneStill[], incoming: UgcSceneStill[]): UgcSceneStill[] {
  const kept = existing.filter(still => still.imageUrl)
  const added = incoming.filter(still => still.imageUrl)
  return [...added, ...kept].slice(0, UGC_MAX_STILL_VERSIONS).map((still, index) => ({ ...still, index }))
}

export function appendUgcAudioTakes(
  existing: UgcClipAudioTake[],
  incoming: UgcClipAudioTake,
): UgcClipAudioTake[] {
  return [incoming, ...existing.filter(take => take.audioUrl !== incoming.audioUrl)].slice(
    0,
    UGC_MAX_AUDIO_TAKES,
  )
}

export function ugcClipAudioTakes(clip: {
  audioTakes?: UgcClipAudioTake[]
  audioUrl?: string
  audioDurationSec?: number
}): UgcClipAudioTake[] {
  if (clip.audioTakes && clip.audioTakes.length > 0) return clip.audioTakes
  if (clip.audioUrl) {
    return [{ id: 'current', audioUrl: clip.audioUrl, durationSec: clip.audioDurationSec }]
  }
  return []
}

export function ugcClipAudioTakeForUrl(
  clips: Array<{ audioTakes?: UgcClipAudioTake[]; audioUrl?: string; audioDurationSec?: number }>,
  url: string,
): UgcClipAudioTake | undefined {
  for (const clip of clips) {
    const take = ugcClipAudioTakes(clip).find(item => item.audioUrl === url)
    if (take) return take
  }
  return undefined
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
  similarity?: number
  style?: number
  speakerBoost?: boolean
  enabled?: boolean
}

export type UgcVoiceLabels = {
  language?: string
  gender?: string
  age?: string
  accent?: string
  useCase?: string
}

export type UgcVoice = {
  id: string
  name: string
  previewUrl?: string
  description?: string
  labels: UgcVoiceLabels
}

export type SearchUgcVoicesQuery = {
  search?: string
  language?: string
  gender?: string
  age?: string
  accent?: string
  category?: string
}

export type SearchUgcVoicesResponse = {
  voices: UgcVoice[]
  hasMore?: boolean
  nextPageToken?: string
}

export const UGC_VOICE_GENDERS = ['female', 'male', 'neutral'] as const
export type UgcVoiceGender = (typeof UGC_VOICE_GENDERS)[number]

export const UGC_VOICE_AGES = ['young', 'middle_aged', 'old'] as const
export type UgcVoiceAge = (typeof UGC_VOICE_AGES)[number]

export const UGC_VOICE_LANGUAGES = [
  { id: 'en', label: '🇺🇸 English' },
  { id: 'es', label: '🇪🇸 Spanish' },
  { id: 'fr', label: '🇫🇷 French' },
  { id: 'de', label: '🇩🇪 German' },
  { id: 'it', label: '🇮🇹 Italian' },
  { id: 'pt', label: '🇵🇹 Portuguese' },
  { id: 'pl', label: '🇵🇱 Polish' },
  { id: 'bg', label: '🇧🇬 Bulgarian' },
  { id: 'hi', label: '🇮🇳 Hindi' },
  { id: 'ja', label: '🇯🇵 Japanese' },
  { id: 'zh', label: '🇨🇳 Chinese' },
  { id: 'ko', label: '🇰🇷 Korean' },
  { id: 'ar', label: '🇸🇦 Arabic' },
] as const

export const UGC_VOICE_ACCENTS = [
  { id: 'american', label: 'American' },
  { id: 'british', label: 'British' },
  { id: 'australian', label: 'Australian' },
  { id: 'indian', label: 'Indian' },
  { id: 'irish', label: 'Irish' },
  { id: 'african', label: 'African' },
] as const

export type UgcSceneStill = {
  index: number
  imageUrl?: string
  generationId?: string
  enhancedPrompt?: string
}

export type UgcClipAudioTake = {
  id: string
  audioUrl: string
  durationSec?: number
  scriptText?: string
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
  audioUrl?: string
  audioDurationSec?: number
  audioTakes?: UgcClipAudioTake[]
  videoUrl?: string
  thumbnailUrl?: string
  generationId?: string
  composedVideoId?: string
  stillsRunId?: string
  videoRunId?: string
  audioRunId?: string
  approved?: boolean
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
  projectId?: string
  createdBy: string
  productId?: string
  productImageUrls: string[]
  productName?: string
  productDescription?: string
  productUrl?: string
  productKind?: UgcProductKind
  influencerId?: string
  voice?: UgcClipVoice
  aspectRatio: string
  videoResolution: VideoResolution
  models: UgcProjectModels
  flowStep?: UgcFlowStep
  clips: UgcClip[]
  assembledVideoUrl?: string
  assembledRunId?: string
  composedProjectVideoId?: string
  error?: string
  createdAt: Date
  updatedAt: Date
}

export type UgcProjectSummary = Pick<
  UgcProject,
  'id' | 'name' | 'status' | 'workspaceId' | 'projectId' | 'productImageUrls' | 'createdAt' | 'updatedAt'
> & {
  clipCount: number
  readyCount: number
  previewImageUrl?: string
}

export type CreateUgcProjectPayload = {
  workspaceId: string
  projectId?: string
  name?: string
  productId?: string
  productImageUrls?: string[]
  productName?: string
  productDescription?: string
  productUrl?: string
  productKind?: UgcProductKind
  influencerId?: string
  aspectRatio?: string
  models?: Partial<UgcProjectModels>
  flowStep?: UgcFlowStep
}

export type UpdateUgcProjectPayload = {
  name?: string
  productId?: string | null
  productImageUrls?: string[]
  productName?: string
  productDescription?: string | null
  productUrl?: string | null
  productKind?: UgcProductKind | null
  influencerId?: string | null
  voice?: UgcClipVoice | null
  aspectRatio?: string
  videoResolution?: VideoResolution
  models?: Partial<UgcProjectModels>
  clipOrder?: string[]
  flowStep?: UgcFlowStep
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
  approved?: boolean
  stills?: UgcSceneStill[]
  audioUrl?: string | null
}

export type OpenUgcEditorResponse = {
  videoId: string
}

export type GenerateUgcScriptPayload = {
  model?: string
}

export type ApplyUgcCampaignPresetPayload = {
  presetId: UgcCampaignPresetId
}

export type GetUgcProjectsResponse = {
  projects: UgcProjectSummary[]
}
