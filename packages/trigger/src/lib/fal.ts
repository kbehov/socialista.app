import { fal } from '@fal-ai/client'
import { logger } from '@trigger.dev/sdk/v3'
import { z } from 'zod'

fal.config({
  credentials: process.env.FAL_KEY,
})

export const FalImageResult = z.object({
  images: z.array(z.object({ url: z.string() })).min(1),
})

export type GenerateFalImageOptions = {
  model: string
  prompt: string
  aspectRatio: string
  workspaceId: string
  userId: string
  imageUrl?: string
  onProgress?: (progress: number, label: string) => void
}

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
  onProgress,
}: GenerateFalImageOptions): Promise<string> {
  const input: Record<string, string> = {
    prompt,
    aspect_ratio: aspectRatio,
  }

  if (imageUrl) {
    input.image_url = imageUrl
  }

  logger.info('Submitting to fal', { model })

  const result = await fal.subscribe(model, {
    input,
    onQueueUpdate: (update: unknown) => {
      const status =
        typeof update === 'object' &&
        update !== null &&
        'status' in update &&
        typeof update.status === 'string'
          ? mapQueueStatus(update.status)
          : null
      if (status) {
        logger.info('fal queue update', { status: status.label })
        onProgress?.(status.progress, status.label)
      }
    },
  })

  logger.info('fal subscribe resolved', { requestId: result.requestId })

  const parsed = FalImageResult.parse(result.data)
  const imageUrlResult = parsed.images[0]?.url

  if (!imageUrlResult) {
    throw new Error('No image was returned from the model')
  }

  return imageUrlResult
}
