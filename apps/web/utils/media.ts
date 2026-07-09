const VIDEO_EXTENSION_PATTERN = /\.(mp4|webm|ogg|mov)(\?.*)?$/i
const IMAGE_EXTENSION_PATTERN = /\.(avif|gif|jpe?g|png|svg|webp)(\?.*)?$/i

export type MediaKind = 'image' | 'video' | 'unknown'

export function isVideoUrl(url: string): boolean {
  return VIDEO_EXTENSION_PATTERN.test(url)
}

export function isImageUrl(url: string): boolean {
  return IMAGE_EXTENSION_PATTERN.test(url)
}

export function getMediaKind(src: string, mimeType?: string): MediaKind {
  if (mimeType?.startsWith('video/')) return 'video'
  if (mimeType?.startsWith('image/')) return 'image'

  if (isVideoUrl(src)) return 'video'
  if (isImageUrl(src)) return 'image'

  return 'unknown'
}
