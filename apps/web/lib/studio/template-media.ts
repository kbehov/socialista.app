import type { AttachedMedia } from '@/components/files/attach-media/types'
import { StudioTemplateKind, type StudioTemplateDto } from '@socialista/types'

const MAX_RECREATE_REFERENCES = 3

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

export function templateToRecreateAttachments(
  template: StudioTemplateDto,
  max = MAX_RECREATE_REFERENCES,
): AttachedMedia[] {
  const urls: string[] = []
  const seen = new Set<string>()

  const push = (url: string | undefined) => {
    if (!url || seen.has(url)) return
    seen.add(url)
    urls.push(url)
  }

  push(template.previewImageUrl)
  if (template.kind === StudioTemplateKind.IMAGE) {
    for (const url of template.payload.referenceImageUrls ?? []) {
      push(url)
    }
  }

  return urls.slice(0, max).map((url, index) => ({
    id: `${template._id}-reference-${index}`,
    url,
    kind: isVideoPreviewUrl(url) ? 'video' : 'image',
    source: 'library',
    label: 'Reference',
  }))
}
