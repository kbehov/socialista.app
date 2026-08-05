'use client'

import {
  isExternalSlideImageUrl,
  proxiedImageUrl,
  unwrapProxiedImageUrl,
} from '@/lib/carousel/image-url'
import { uploadToWorkspace } from '@/services/files.service'
import type { Slide } from '@socialista/types'

export type PersistSlideImagesProgress = {
  current: number
  total: number
}

type PersistSlideExternalImagesOptions = {
  onProgress?: (progress: PersistSlideImagesProgress) => void
}

function extensionFromMime(mime: string): string {
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg'
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('png')) return 'png'
  return 'png'
}

async function fetchSlideImageBlob(imageUrl: string): Promise<Blob> {
  const trimmed = imageUrl.trim()
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) {
    const response = await fetch(trimmed)
    if (!response.ok) throw new Error('Failed to read local image')
    return response.blob()
  }

  const unwrapped = unwrapProxiedImageUrl(trimmed)
  const response = await fetch(proxiedImageUrl(unwrapped))
  if (!response.ok) {
    throw new Error('Failed to fetch external image')
  }
  return response.blob()
}

async function uploadSlideImageToWorkspace(workspaceId: string, imageUrl: string): Promise<string> {
  const blob = await fetchSlideImageBlob(imageUrl)
  const ext = extensionFromMime(blob.type)
  const file = new File([blob], `slideshow-${Date.now()}.${ext}`, {
    type: blob.type || 'image/png',
  })
  const formData = new FormData()
  formData.append('file', file)

  const response = await uploadToWorkspace(workspaceId, formData)
  if (!response.success || !response.data?.url) {
    throw new Error(response.message ?? 'Failed to upload image')
  }
  return response.data.url
}

/**
 * Upload any external / proxied / local transient slide images to workspace storage
 * and return slides that only reference stable R2 URLs (ready for export/render).
 */
export async function persistSlideExternalImages(
  workspaceId: string,
  slides: Slide[],
  { onProgress }: PersistSlideExternalImagesOptions = {},
): Promise<Slide[]> {
  const urls = new Set<string>()
  for (const slide of slides) {
    if (isExternalSlideImageUrl(slide.backgroundImageUrl)) {
      urls.add(slide.backgroundImageUrl)
    }
    for (const layer of slide.layers) {
      if (layer.type === 'image' && isExternalSlideImageUrl(layer.imageUrl)) {
        urls.add(layer.imageUrl)
      }
    }
  }

  const uniqueUrls = [...urls]
  const rewritten = new Map<string, string>()

  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i]!
    rewritten.set(url, await uploadSlideImageToWorkspace(workspaceId, url))
    onProgress?.({ current: i + 1, total: uniqueUrls.length })
  }

  if (rewritten.size === 0) return slides

  return slides.map(slide => {
    const backgroundImageUrl = rewritten.get(slide.backgroundImageUrl) ?? slide.backgroundImageUrl
    const layers = slide.layers.map(layer => {
      if (layer.type !== 'image') return layer
      const imageUrl = rewritten.get(layer.imageUrl) ?? layer.imageUrl
      return imageUrl === layer.imageUrl ? layer : { ...layer, imageUrl }
    })
    if (backgroundImageUrl === slide.backgroundImageUrl && layers === slide.layers) {
      return slide
    }
    return { ...slide, backgroundImageUrl, layers }
  })
}
