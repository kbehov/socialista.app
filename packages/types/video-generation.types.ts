export type VideoAspectRatio = '1:1' | '16:9' | '9:16'

export const VIDEO_ASPECT_RATIOS = ['1:1', '16:9', '9:16'] as const satisfies readonly VideoAspectRatio[]

export const VIDEO_DURATION_MIN = 5
export const VIDEO_DURATION_MAX = 15
export const VIDEO_DURATION_DEFAULT = 5

export const VIDEO_DURATIONS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const satisfies readonly number[]

export const VIDEO_RESOLUTIONS = ['720p', '1080p'] as const
export type VideoResolution = (typeof VIDEO_RESOLUTIONS)[number]
export const VIDEO_RESOLUTION_DEFAULT: VideoResolution = '720p'
export const VIDEO_RESOLUTION_COST_MULTIPLIERS = {
  '720p': 1,
  '1080p': 1.5,
} as const satisfies Record<VideoResolution, number>

export function parseVideoResolution(value: unknown): VideoResolution {
  return value === '1080p' || value === '720p' ? value : VIDEO_RESOLUTION_DEFAULT
}

export function videoResolutionCostMultiplier(resolution?: string): number {
  return VIDEO_RESOLUTION_COST_MULTIPLIERS[parseVideoResolution(resolution)]
}

export function clampVideoDuration(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return VIDEO_DURATION_DEFAULT
  return Math.min(VIDEO_DURATION_MAX, Math.max(VIDEO_DURATION_MIN, Math.round(n)))
}

export type VideoGenerationOutput = {
  videoUrl: string
  cost: number
  generationId: string
  durationSec: number
  videoId?: string
}

export type VideoGenerator = (options: {
  model: string
  prompt: string
  aspectRatio: VideoAspectRatio
  workspaceId: string
  userId: string
  duration: number
  generateAudio?: boolean
  resolution?: VideoResolution
  imageUrl?: string
  imageUrls?: string[]
  onProgress?: (progress: number, label: string) => void
}) => Promise<string>
