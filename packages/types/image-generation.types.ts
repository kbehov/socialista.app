export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3'

export const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3'] as const satisfies readonly AspectRatio[]

export const IMAGE_GENERATION_COUNT_MIN = 1
export const IMAGE_GENERATION_COUNT_MAX = 3
export const IMAGE_GENERATION_COUNT_DEFAULT = 1

export function clampImageGenerationCount(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return IMAGE_GENERATION_COUNT_DEFAULT
  return Math.min(
    IMAGE_GENERATION_COUNT_MAX,
    Math.max(IMAGE_GENERATION_COUNT_MIN, Math.round(n)),
  )
}

export type ImageGenerationStatus = {
  progress: number
  label: string
}

export type ImageGenerationError = {
  message: string
}

export type ImageGenerationOutput = {
  imageUrl: string
  imageUrls?: string[]
  cost: number
  generationId: string
}

export type ImageGenerator = (options: {
  model: string
  prompt: string
  aspectRatio: AspectRatio
  workspaceId: string
  userId: string
  imageUrl?: string
  imageUrls?: string[]
  numImages?: number
  onProgress?: (progress: number, label: string) => void
}) => Promise<string[]>

export const TASK_IDS = {
  imageGeneration: 'realtime-image-generation',
  staticAdGeneration: 'realtime-static-ad-generation',
  refreshAccountToken: 'refresh-account-token',
  publishPost: 'publish-post',
  analyticsSweep: 'analytics-sweep',
  fetchAccountAnalytics: 'fetch-account-analytics',
  videoExport: 'export-video',
  generateInfluencer: 'generate-influencer',
  cloneInfluencer: 'clone-influencer',
  generateUgcStills: 'generate-ugc-stills',
  generateUgcVideo: 'generate-ugc-video',
} as const

export type TaskId = (typeof TASK_IDS)[keyof typeof TASK_IDS]

export const STATIC_AD_MODEL = 'openai/gpt-image-2' as const
