import type { AspectRatio } from '@socialista/types'
import { logger } from '@trigger.dev/sdk/v3'
import { generateImage } from 'ai'
import { uploadGeneratedImage } from '../services/image-upload.js'

export type GenerateVercelImageOptions = {
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

const SIZE_BASED_MODEL_PATTERN = /gpt-image|dall-e/i

function aspectRatioToSize(aspectRatio: AspectRatio): `${number}x${number}` {
  switch (aspectRatio) {
    case '16:9':
    case '4:3':
      return '1536x1024'
    case '9:16':
      return '1024x1536'
    default:
      return '1024x1024'
  }
}

function usesImageSize(model: string): boolean {
  return SIZE_BASED_MODEL_PATTERN.test(model)
}

export async function generateImageVercel({
  model,
  prompt,
  aspectRatio,
  workspaceId,
  userId,
  imageUrl,
  imageUrls,
  numImages = 1,
  onProgress,
}: GenerateVercelImageOptions): Promise<string[]> {
  onProgress?.(65, 'Rendering')

  const referenceImages = [
    ...(imageUrls ?? []),
    ...(imageUrl && !(imageUrls ?? []).includes(imageUrl) ? [imageUrl] : []),
  ]
  const promptArg = referenceImages.length > 0 ? { text: prompt, images: referenceImages } : prompt

  logger.info('Submitting to Vercel AI', {
    model,
    aspectRatio,
    numImages,
    referenceCount: referenceImages.length,
  })

  const { images } = await generateImage(
    usesImageSize(model)
      ? {
          model,
          prompt: promptArg,
          n: numImages,
          maxImagesPerCall: numImages,
          size: aspectRatioToSize(aspectRatio),
        }
      : {
          model,
          prompt: promptArg,
          n: numImages,
          maxImagesPerCall: numImages,
          aspectRatio,
        },
  )

  if (images.length === 0) {
    throw new Error('No image was returned from the model')
  }

  onProgress?.(90, numImages > 1 ? 'Uploading images' : 'Uploading image')

  const urls = await Promise.all(
    images.slice(0, numImages).map(image =>
      uploadGeneratedImage({
        workspaceId,
        userId,
        bytes: image.uint8Array,
        mediaType: image.mediaType,
      }),
    ),
  )

  logger.info('Vercel images stored', { count: urls.length })

  return urls
}
