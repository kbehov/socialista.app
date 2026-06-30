'use client'

import { fal } from '@/lib/fal'

async function uploadBlob(blob: Blob): Promise<string> {
  const file = blob instanceof File ? blob : new File([blob], 'slide-background.jpg', { type: blob.type || 'image/jpeg' })
  return fal.storage.upload(file)
}

/** Resolve a slide background URL to a publicly accessible URL for fal.ai. */
export async function resolveFalImageUrl(imageUrl: string): Promise<string> {
  const trimmed = imageUrl.trim()
  if (!trimmed) {
    throw new Error('No image URL')
  }

  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    const response = await fetch(trimmed)
    if (!response.ok) throw new Error('Failed to read local image')
    return uploadBlob(await response.blob())
  }

  if (trimmed.startsWith('/api/image-proxy')) {
    const query = trimmed.includes('?') ? trimmed.slice(trimmed.indexOf('?') + 1) : ''
    const original = new URLSearchParams(query).get('url')
    if (original) return original
  }

  if (trimmed.startsWith('/')) {
    const response = await fetch(trimmed)
    if (!response.ok) throw new Error('Failed to fetch image')
    return uploadBlob(await response.blob())
  }

  return trimmed
}
