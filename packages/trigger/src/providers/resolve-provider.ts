import type { ImageGenerator } from '@socialista/types'
import { generateImageFal } from './fal.js'
import { generateImageVercel } from './vercel.js'

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
