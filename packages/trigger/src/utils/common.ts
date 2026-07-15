import { generateImageFal } from '../lib/fal.js'
import { generateImageVercel } from '../lib/vercel.js'
import type { ImageGenerator } from '../types/image-generation.types.js'
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
