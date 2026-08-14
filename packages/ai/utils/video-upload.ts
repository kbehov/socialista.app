import type { UploadGeneratedVideoInput, UploadGeneratedVideoResponse } from '@socialista/types'
import { Buffer } from 'node:buffer'

const MAX_REMOTE_VIDEO_BYTES = 200 * 1024 * 1024

function extensionForMediaType(mediaType: string): string {
  if (mediaType.includes('webm')) return 'webm'
  if (mediaType.includes('quicktime') || mediaType.includes('mov')) return 'mov'
  return 'mp4'
}

function normalizeVideoMediaType(value: string | null): string {
  const mediaType = (value ?? 'video/mp4').split(';')[0]?.trim() || 'video/mp4'
  return mediaType.startsWith('video/') ? mediaType : 'video/mp4'
}

export async function downloadRemoteVideo(url: string): Promise<{ bytes: Uint8Array; mediaType: string }> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download generated video (${response.status})`)
  }

  const bytes = new Uint8Array(await response.arrayBuffer())
  if (bytes.byteLength > MAX_REMOTE_VIDEO_BYTES) {
    throw new Error('Generated video exceeds the maximum size')
  }

  return { bytes, mediaType: normalizeVideoMediaType(response.headers.get('content-type')) }
}

export async function uploadGeneratedVideo({
  workspaceId,
  userId,
  bytes,
  mediaType,
  filename,
}: UploadGeneratedVideoInput): Promise<string> {
  const apiUrl = process.env.API_URL ?? 'http://localhost:8080'
  const secret = process.env.INTERNAL_API_SECRET

  if (!secret) {
    throw new Error('INTERNAL_API_SECRET is not configured')
  }

  const formData = new FormData()
  const blob = new Blob([Buffer.from(bytes)], { type: mediaType || 'video/mp4' })
  formData.append('file', blob, filename ?? `generated.${extensionForMediaType(mediaType)}`)
  formData.append('userId', userId)

  const response = await fetch(`${apiUrl}/generated-videos/workspace/${workspaceId}`, {
    method: 'POST',
    headers: {
      'x-internal-api-secret': secret,
    },
    body: formData,
  })

  const body = (await response.json().catch(() => null)) as UploadGeneratedVideoResponse | null

  if (!response.ok || !body?.success || !body.data?.url) {
    const message = body?.message ?? `Video upload failed (${response.status})`
    console.error('Generated video upload failed', { status: response.status, message })
    throw new Error(message)
  }

  console.log('Generated video uploaded to library', { url: body.data.url, fileId: body.data._id })

  return body.data.url
}
