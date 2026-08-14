export type VideoAspectRatio = '1:1' | '16:9' | '9:16'

export const VIDEO_ASPECT_RATIOS = ['1:1', '16:9', '9:16'] as const satisfies readonly VideoAspectRatio[]

export const VIDEO_DURATION_MIN = 5
export const VIDEO_DURATION_MAX = 15
export const VIDEO_DURATION_DEFAULT = 5

export const VIDEO_DURATIONS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const satisfies readonly number[]

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
  imageUrl?: string
  imageUrls?: string[]
  onProgress?: (progress: number, label: string) => void
}) => Promise<string>
