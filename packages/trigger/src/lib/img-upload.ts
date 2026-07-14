import { logger } from '@trigger.dev/sdk/v3'
import { Buffer } from 'node:buffer'

export type UploadGeneratedImageInput = {
  workspaceId: string
  userId: string
  bytes: Uint8Array
  mediaType: string
  filename?: string
}

type UploadGeneratedImageResponse = {
  success: boolean
  data?: {
    url: string
    _id: string
  }
  message?: string
}

function extensionForMediaType(mediaType: string): string {
  if (mediaType.includes('jpeg') || mediaType.includes('jpg')) return 'jpg'
  if (mediaType.includes('webp')) return 'webp'
  if (mediaType.includes('gif')) return 'gif'
  return 'png'
}

export async function uploadGeneratedImage({
  workspaceId,
  userId,
  bytes,
  mediaType,
  filename,
}: UploadGeneratedImageInput): Promise<string> {
  const apiUrl = process.env.API_URL ?? 'http://localhost:8080'
  const secret = process.env.INTERNAL_API_SECRET

  if (!secret) {
    throw new Error('INTERNAL_API_SECRET is not configured')
  }

  const formData = new FormData()
  const blob = new Blob([Buffer.from(bytes)], { type: mediaType })
  formData.append('file', blob, filename ?? `generated.${extensionForMediaType(mediaType)}`)
  formData.append('userId', userId)

  const response = await fetch(`${apiUrl}/generated-images/workspace/${workspaceId}`, {
    method: 'POST',
    headers: {
      'x-internal-api-secret': secret,
    },
    body: formData,
  })

  const body = (await response.json().catch(() => null)) as UploadGeneratedImageResponse | null

  if (!response.ok || !body?.success || !body.data?.url) {
    const message = body?.message ?? `Image upload failed (${response.status})`
    logger.error('Generated image upload failed', { status: response.status, message })
    throw new Error(message)
  }

  logger.info('Generated image uploaded to R2', { url: body.data.url, imageId: body.data._id })

  return body.data.url
}
