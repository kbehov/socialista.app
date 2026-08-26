import { fal } from '@fal-ai/client'
import { logger } from '@trigger.dev/sdk/v3'
import { z } from 'zod'
import type { AspectRatio } from '@socialista/types'
import { downloadRemoteImage, uploadGeneratedImage } from '../services/image-upload.js'

fal.config({
  credentials: process.env.FAL_KEY,
})

export const FalImageResult = z.object({
  images: z.array(z.object({ url: z.string() })).min(1),
})

export type GenerateFalImageOptions = {
  model: string
  prompt: string
  aspectRatio: AspectRatio
  workspaceId: string
  userId: string
  imageUrl?: string
  imageUrls?: string[]
  numImages?: number
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

async function persistFalImageUrl(
  url: string,
  workspaceId: string,
  userId: string,
): Promise<string> {
  try {
    const downloaded = await downloadRemoteImage(url)
    return await uploadGeneratedImage({
      workspaceId,
      userId,
      bytes: downloaded.bytes,
      mediaType: downloaded.mediaType,
    })
  } catch (error) {
    logger.error('Failed to persist fal image, using provider URL', {
      error: error instanceof Error ? error.message : String(error),
    })
    return url
  }
}

export async function generateImageFal({
  model,
  prompt,
  aspectRatio,
  workspaceId,
  userId,
  imageUrl,
  imageUrls,
  numImages = 1,
  onProgress,
}: GenerateFalImageOptions): Promise<string[]> {
  const input: Record<string, unknown> = {
    prompt,
    aspect_ratio: aspectRatio,
    num_images: numImages,
  }

  const referenceImage = imageUrl ?? imageUrls?.[0]
  if (referenceImage) {
    input.image_url = referenceImage
  }

  logger.info('Submitting to fal', { model, numImages })

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
  const urls = parsed.images.map(image => image.url).filter(Boolean).slice(0, numImages)

  if (urls.length === 0) {
    throw new Error('No image was returned from the model')
  }

  if (!workspaceId || !userId) {
    return urls
  }

  onProgress?.(90, 'Saving to files')
  return Promise.all(urls.map(url => persistFalImageUrl(url, workspaceId, userId)))
}
