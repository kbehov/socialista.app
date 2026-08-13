import { fal } from '@fal-ai/client'

import type { GenerateImageOptions } from '@socialista/types'
import { z } from 'zod'

fal.config({
  credentials: process.env.FAL_KEY as string,
})
// Export the fal client
export { fal }
// Export the schema for the image result
export const FalImageResult = z.object({
  images: z.array(z.object({ url: z.string() })).min(1),
})

function mapQueueStatus(status: string | undefined): { progress: number; label: string } | null {
  switch (status) {
    case 'IN_QUEUE':
      return { progress: 50, label: 'Waiting in queue' }
    case 'IN_PROGRESS':
      return { progress: 65, label: 'Rendering' }
    case 'COMPLETED':
      return { progress: 90, label: 'Finalizing' }
    default:
      return null
  }
}

function collectReferenceImages(imageUrl?: string, imageUrls?: string[]): string[] {
  const refs = [...(imageUrls ?? [])]
  if (imageUrl && !refs.includes(imageUrl)) {
    refs.push(imageUrl)
  }
  return refs
}

/** Map refs to `image_urls` (edit/multi-ref) or `image_url` (single-image) per fal model schema. */
function buildFalImageInput(
  model: string,
  referenceImages: string[],
): { image_urls: string[] } | { image_url: string } {
  const id = model.toLowerCase()
  const usesImageUrls =
    id.includes('/edit') ||
    id.includes('/multi') ||
    id.includes('nano-banana') ||
    id.includes('grok-imagine-image') ||
    id.includes('flux-2')

  if (usesImageUrls) {
    return { image_urls: referenceImages }
  }

  return { image_url: referenceImages[0]! }
}

export async function generateImageFal({
  model,
  prompt,
  aspectRatio,
  imageUrl,
  imageUrls,
  seed,
  onProgress,
}: GenerateImageOptions): Promise<string> {
  const referenceImages = collectReferenceImages(imageUrl, imageUrls)

  const input: Record<string, unknown> = {
    prompt,
    aspect_ratio: aspectRatio,
  }

  if (referenceImages.length > 0) {
    Object.assign(input, buildFalImageInput(model, referenceImages))
  }

  if (seed !== undefined) {
    input.seed = seed
  }

  console.log('Submitting to fal', {
    model,
    referenceCount: referenceImages.length,
    imageField: referenceImages.length > 0 ? ('image_urls' in input ? 'image_urls' : 'image_url') : null,
  })

  const result = await fal.subscribe(model, {
    input,
    onQueueUpdate: (update: unknown) => {
      const status =
        typeof update === 'object' && update !== null && 'status' in update && typeof update.status === 'string'
          ? mapQueueStatus(update.status)
          : null
      if (status) {
        console.log('fal queue update', { status: status.label })
        onProgress?.(status.progress, status.label)
      }
    },
  })

  console.log('fal subscribe resolved', { requestId: result.requestId })

  const parsed = FalImageResult.parse(result.data)
  const imageUrlResult = parsed.images[0]?.url

  if (!imageUrlResult) {
    throw new Error('No image was returned from the model')
  }

  return imageUrlResult
}

const FalVideoResult = z
  .object({
    video: z.object({ url: z.string() }).optional(),
    video_url: z.string().optional(),
  })
  .refine(data => Boolean(data.video?.url ?? data.video_url), {
    message: 'No video was returned from the model',
  })

export type GenerateFalVideoOptions = {
  model: string
  prompt: string
  imageUrl: string
  aspectRatio?: string
  negativePrompt?: string
  duration?: number
  onProgress?: (progress: number, label: string) => void
}

/** Map 5–15s clip length to the closest value the fal model typically accepts. */
export function mapFalVideoDuration(model: string, durationSec: number): string | number {
  const id = model.toLowerCase()
  const clamped = Math.min(15, Math.max(5, Math.round(durationSec)))
  if (id.includes('kling')) {
    return clamped <= 7 ? '5' : '10'
  }
  if (id.includes('hailuo') || id.includes('minimax')) {
    return clamped <= 8 ? 6 : 10
  }
  return clamped
}

export async function generateVideoFal({
  model,
  prompt,
  imageUrl,
  aspectRatio = '9:16',
  negativePrompt,
  duration,
  onProgress,
}: GenerateFalVideoOptions): Promise<string> {
  const input: Record<string, unknown> = {
    prompt,
    image_url: imageUrl,
    aspect_ratio: aspectRatio,
  }

  if (negativePrompt) {
    input.negative_prompt = negativePrompt
  }

  if (duration !== undefined) {
    input.duration = mapFalVideoDuration(model, duration)
  }

  const result = await fal.subscribe(model, {
    input,
    onQueueUpdate: (update: unknown) => {
      const status =
        typeof update === 'object' && update !== null && 'status' in update && typeof update.status === 'string'
          ? mapQueueStatus(update.status)
          : null
      if (status) {
        onProgress?.(status.progress, status.label)
      }
    },
  })

  const parsed = FalVideoResult.parse(result.data)
  const videoUrl = parsed.video?.url ?? parsed.video_url
  if (!videoUrl) {
    throw new Error('No video was returned from the model')
  }

  return videoUrl
}
