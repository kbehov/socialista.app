import { getMediaKind, type MediaKind } from '@/utils/media'
import type { ImageResponse } from '@socialista/types'
import { IMAGE_MAX_BYTES, VIDEO_MAX_BYTES } from './constants'
import type { AttachMediaAccept, AttachedMedia } from './types'

export function resolveAcceptAttr(accept: AttachMediaAccept): string {
  switch (accept) {
    case 'video':
      return 'video/*'
    case 'media':
      return 'image/*,video/*'
    case 'image':
    default:
      return 'image/*'
  }
}

export function resolveMaxSize(accept: AttachMediaAccept, maxSize?: number): number {
  if (typeof maxSize === 'number') return maxSize
  return accept === 'image' ? IMAGE_MAX_BYTES : VIDEO_MAX_BYTES
}

export function allowedKinds(accept: AttachMediaAccept): ReadonlySet<'image' | 'video'> {
  switch (accept) {
    case 'video':
      return new Set(['video'])
    case 'media':
      return new Set(['image', 'video'])
    case 'image':
    default:
      return new Set(['image'])
  }
}

export function isAllowedKind(kind: MediaKind, accept: AttachMediaAccept): kind is 'image' | 'video' {
  return kind === 'image' || kind === 'video' ? allowedKinds(accept).has(kind) : false
}

export function isAllowedMime(type: string, accept: AttachMediaAccept): boolean {
  const isImage = type.startsWith('image/')
  const isVideo = type.startsWith('video/')
  switch (accept) {
    case 'video':
      return isVideo
    case 'media':
      return isImage || isVideo
    case 'image':
    default:
      return isImage
  }
}

export function fileLabel(file: ImageResponse, fallback = 'File') {
  try {
    return decodeURIComponent(new URL(file.url).pathname.split('/').pop() ?? fallback)
  } catch {
    return fallback
  }
}

export function resolveKind(file: ImageResponse, mimeType?: string): 'image' | 'video' | null {
  const kind = getMediaKind(file.url, mimeType)
  return kind === 'image' || kind === 'video' ? kind : null
}

export function toAttachedFromLibrary(file: ImageResponse): AttachedMedia | null {
  const kind = resolveKind(file)
  if (!kind) return null

  return {
    id: file._id,
    url: file.url,
    name: fileLabel(file, kind === 'video' ? 'Video' : 'Image'),
    width: file.width,
    height: file.height,
    kind,
    source: 'library',
  }
}

export function toAttachedFromUpload(
  file: ImageResponse,
  name?: string,
  mimeType?: string,
): AttachedMedia | null {
  const kind = resolveKind(file, mimeType)
  if (!kind) return null

  return {
    id: file._id,
    url: file.url,
    name: name ?? fileLabel(file, kind === 'video' ? 'Video' : 'Image'),
    width: file.width,
    height: file.height,
    kind,
    source: 'upload',
  }
}

export function buildLimitMessage(
  maxSelect: number,
  noun: string,
  nounPlural: string,
): string {
  return `You can attach up to ${maxSelect} ${maxSelect === 1 ? noun : nounPlural}.`
}
