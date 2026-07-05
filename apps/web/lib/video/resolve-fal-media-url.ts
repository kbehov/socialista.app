'use client'

import { fal } from '@/lib/fal'

async function uploadBlob(blob: Blob, filename: string): Promise<string> {
  const file = blob instanceof File ? blob : new File([blob], filename, { type: blob.type || 'application/octet-stream' })
  return fal.storage.upload(file)
}

/** Resolve a clip media URL to a publicly accessible URL for fal.ai. */
export async function resolveFalMediaUrl(sourceUrl: string, kind: 'image' | 'video'): Promise<string> {
  const trimmed = sourceUrl.trim()
  if (!trimmed) {
    throw new Error('No media URL')
  }

  const fallbackName = kind === 'video' ? 'clip.mp4' : 'clip.jpg'

  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    const response = await fetch(trimmed)
    if (!response.ok) throw new Error('Failed to read local media')
    return uploadBlob(await response.blob(), fallbackName)
  }

  if (trimmed.startsWith('/api/media-proxy')) {
    const query = trimmed.includes('?') ? trimmed.slice(trimmed.indexOf('?') + 1) : ''
    const original = new URLSearchParams(query).get('url')
    if (original) return original
  }

  if (trimmed.startsWith('/')) {
    const response = await fetch(trimmed)
    if (!response.ok) throw new Error('Failed to fetch media')
    return uploadBlob(await response.blob(), fallbackName)
  }

  return trimmed
}
