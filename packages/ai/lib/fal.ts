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

export async function generateImageFal({
  model,
  prompt,
  aspectRatio,
  imageUrl,
  imageUrls,
  seed,
  onProgress,
}: GenerateImageOptions): Promise<string> {
  const input: Record<string, string | number> = {
    prompt,
    aspect_ratio: aspectRatio,
  }

  const referenceImage = imageUrl ?? imageUrls?.[0]
  if (referenceImage) {
    input.image_url = referenceImage
  }

  if (seed !== undefined) {
    input.seed = seed
  }

  console.log('Submitting to fal', { model })

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
