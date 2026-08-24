import type { ImageGenerator, VideoGenerator } from '@socialista/types'
import { generateImageFal, generateVideoFal } from './fal.js'
import { generateImageVercel, generateVideoVercel } from './vercel.js'

function normalizeProvider(provider: string): string {
  return provider.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '')
}

export function resolveImageGenerator(modelProvider: string): ImageGenerator {
  const provider = normalizeProvider(modelProvider)

  if (provider.includes('fal')) {
    return generateImageFal
  }

  if (provider === 'vercel') {
    return generateImageVercel
  }

  throw new Error(`Unsupported image provider: ${modelProvider}`)
}

export function resolveVideoGenerator(modelProvider: string): VideoGenerator {
  const provider = normalizeProvider(modelProvider)

  if (provider.includes('fal')) {
    return generateVideoFal
  }

  if (provider === 'vercel') {
    return generateVideoVercel
  }

  throw new Error(`Unsupported video provider: ${modelProvider}`)
}
