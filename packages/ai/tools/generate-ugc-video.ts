import { generateVideoFal } from '../providers/fal.js'

export type GenerateUgcVideoInput = {
  model: string
  provider: string
  prompt: string
  imageUrl: string
  aspectRatio?: string
  negativePrompt?: string
  duration?: number
  generateAudio?: boolean
  onProgress?: (progress: number, label: string) => void
}

export async function generateUgcVideo(input: GenerateUgcVideoInput): Promise<string> {
  const provider = input.provider.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')
  if (!provider.includes('fal')) {
    throw new Error(`Unsupported video provider: ${input.provider}`)
  }

  return generateVideoFal({
    model: input.model,
    prompt: input.prompt,
    imageUrl: input.imageUrl,
    aspectRatio: input.aspectRatio,
    negativePrompt: input.negativePrompt,
    duration: input.duration,
    generateAudio: input.generateAudio,
    onProgress: input.onProgress,
  })
}
