import { UGC_DEFAULT_DURATION, type VideoAspectRatio, type VideoResolution } from '@socialista/types'
import { generateVideoFal } from '../providers/fal.js'
import { generateVideoVercel } from '../providers/vercel.js'

export type GenerateUgcVideoInput = {
  model: string
  provider: string
  prompt: string
  imageUrl: string
  aspectRatio?: string
  negativePrompt?: string
  duration?: number
  generateAudio?: boolean
  resolution?: VideoResolution
  workspaceId: string
  userId: string
  onProgress?: (progress: number, label: string) => void
}

function normalizeProvider(provider: string): string {
  return provider.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')
}

function toVideoAspectRatio(value?: string): VideoAspectRatio {
  if (value === '1:1' || value === '16:9' || value === '9:16') return value
  return '9:16'
}

export async function generateUgcVideo(input: GenerateUgcVideoInput): Promise<string> {
  const provider = normalizeProvider(input.provider)

  if (provider.includes('fal')) {
    return generateVideoFal({
      model: input.model,
      prompt: input.prompt,
      imageUrl: input.imageUrl,
      aspectRatio: input.aspectRatio,
      negativePrompt: input.negativePrompt,
      duration: input.duration,
      generateAudio: input.generateAudio,
      resolution: input.resolution,
      workspaceId: input.workspaceId,
      userId: input.userId,
      onProgress: input.onProgress,
    })
  }

  if (provider === 'vercel') {
    return generateVideoVercel({
      model: input.model,
      prompt: input.prompt,
      imageUrl: input.imageUrl,
      aspectRatio: toVideoAspectRatio(input.aspectRatio),
      workspaceId: input.workspaceId,
      userId: input.userId,
      duration: input.duration ?? UGC_DEFAULT_DURATION,
      generateAudio: input.generateAudio,
      resolution: input.resolution,
      onProgress: input.onProgress,
    })
  }

  throw new Error(`Unsupported video provider: ${input.provider}`)
}
