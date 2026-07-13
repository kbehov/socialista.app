import { proxiedImageUrl } from '@/lib/carousel/image-url'

export function isDataImageUrl(url: string): boolean {
  return url.startsWith('data:image/')
}

/** Display URL for generated images — proxies remote fal URLs, passes through data/blob paths. */
export function resolveGeneratedImagePreviewUrl(imageUrl: string): string {
  if (!imageUrl) return ''
  return proxiedImageUrl(imageUrl)
}

/** Convert a data URL to a blob URL for lighter DOM preview of large base64 payloads. */
export async function dataImageUrlToBlobUrl(dataUrl: string): Promise<string> {
  const response = await fetch(dataUrl)
  if (!response.ok) {
    throw new Error('Failed to decode generated image')
  }
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}
