import type { AttachedMedia } from '@/components/files/attach-media/types'
import type { StudioTemplateDto } from '@socialista/types'

const VIDEO_URL_EXT = /\.(mp4|webm|mov|m4v|ogv|ogg)$/i

export function isVideoPreviewUrl(url: string): boolean {
  try {
    return VIDEO_URL_EXT.test(new URL(url).pathname)
  } catch {
    return VIDEO_URL_EXT.test(url)
  }
}

export function templateReferencesToAttachedMedia(
  template: StudioTemplateDto,
  urls: string[],
): AttachedMedia[] {
  const label = template.name ?? 'Template reference'
  return urls.map((url, index) => ({
    id: `${template._id}-reference-${index}`,
    url,
    name: label,
    kind: isVideoPreviewUrl(url) ? 'video' : 'image',
    source: 'library',
    label,
  }))
}
