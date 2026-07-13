import { proxiedImageUrl } from '@/lib/carousel/image-url'
import { uploadToWorkspace } from '@/services/files.service'
import type { ImageResponse } from '@socialista/types'

function extensionFromMime(mime: string): string {
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('png')) return 'png'
  return 'png'
}

export function buildGeneratedFilename(prompt?: string): string {
  const slug = (prompt ?? 'image')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)

  return `generated-${slug || 'image'}-${Date.now()}`
}

async function fetchProxiedImageBlob(imageUrl: string): Promise<Blob> {
  const response = await fetch(proxiedImageUrl(imageUrl))
  if (!response.ok) {
    throw new Error('Failed to fetch image')
  }
  return response.blob()
}

export async function downloadGeneratedImage(imageUrl: string, prompt?: string): Promise<void> {
  const blob = await fetchProxiedImageBlob(imageUrl)
  const ext = extensionFromMime(blob.type)
  const filename = `${buildGeneratedFilename(prompt)}.${ext}`
  const objectUrl = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = objectUrl
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(objectUrl)
}

export async function saveGeneratedImageToWorkspace(
  workspaceId: string,
  imageUrl: string,
  prompt?: string,
): Promise<ImageResponse> {
  const blob = await fetchProxiedImageBlob(imageUrl)
  const ext = extensionFromMime(blob.type)
  const filename = `${buildGeneratedFilename(prompt)}.${ext}`
  const file = new File([blob], filename, { type: blob.type || 'image/png' })
  const formData = new FormData()
  formData.append('file', file)

  const response = await uploadToWorkspace(workspaceId, formData)
  if (!response.success || !response.data) {
    throw new Error(response.message ?? 'Failed to save to files')
  }

  return response.data
}
