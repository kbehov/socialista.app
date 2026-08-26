import type { UploadGeneratedImageInput, UploadGeneratedImageResponse } from '@socialista/types'
import { Buffer } from 'node:buffer'

const MAX_REMOTE_IMAGE_BYTES = 50 * 1024 * 1024

function extensionForMediaType(mediaType: string): string {
  if (mediaType.includes('jpeg') || mediaType.includes('jpg')) return 'jpg'
  if (mediaType.includes('webp')) return 'webp'
  if (mediaType.includes('gif')) return 'gif'
  return 'png'
}

function normalizeImageMediaType(value: string | null): string {
  const mediaType = (value ?? 'image/png').split(';')[0]?.trim() || 'image/png'
  return mediaType.startsWith('image/') ? mediaType : 'image/png'
}

export async function downloadRemoteImage(url: string): Promise<{ bytes: Uint8Array; mediaType: string }> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download generated image (${response.status})`)
  }

  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.byteLength > MAX_REMOTE_IMAGE_BYTES) {
    throw new Error('Generated image exceeds the maximum size')
  }

  return { bytes, mediaType: normalizeImageMediaType(response.headers.get('content-type')) }
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
    console.error('Generated image upload failed', { status: response.status, message })
    throw new Error(message)
  }

  console.log('Generated image uploaded to R2', { url: body.data.url, imageId: body.data._id })

  return body.data.url
}
