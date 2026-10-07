import type { AttachedMedia } from '@/components/files/attach-media/types'
import { StudioTemplateKind, type StudioTemplateDto } from '@socialista/types'

const MAX_RECREATE_REFERENCES = 3

const VIDEO_URL_EXT = /\.(mp4|webm|mov|m4v|ogv|ogg)$/i
const IMAGE_URL_EXT = /\.(png|jpe?g|webp|gif|avif)$/i

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

function pathnameOf(url: string): string {
  try {
    return new URL(url).pathname
  } catch {
    return url
  }
}

function isImagePreviewUrl(url: string): boolean {
  return IMAGE_URL_EXT.test(pathnameOf(url))
}

/** Clip to send as a video reference. Preview is often a still; the file lives on sourceImageUrl. */
function videoTemplateClipUrl(template: StudioTemplateDto): string | undefined {
  if (template.kind !== StudioTemplateKind.VIDEO) return undefined
  const source = template.sourceImageUrl
  const preview = template.previewImageUrl
  const withExtension = [source, preview].find(url => url && isVideoPreviewUrl(url))
  if (withExtension) return withExtension
  if (source && source !== preview && !isImagePreviewUrl(source)) return source
  return undefined
}

export function templateToRecreateAttachments(
  template: StudioTemplateDto,
  max = MAX_RECREATE_REFERENCES,
): AttachedMedia[] {
  const items: { url: string; kind: 'image' | 'video' }[] = []
  const seen = new Set<string>()

  const push = (url: string | undefined, kind: 'image' | 'video') => {
    if (!url || seen.has(url)) return
    seen.add(url)
    items.push({ url, kind })
  }

  const pushImage = (url: string | undefined) => {
    if (url && isVideoPreviewUrl(url)) return
    push(url, 'image')
  }

  if (template.kind === StudioTemplateKind.VIDEO) {
    push(videoTemplateClipUrl(template), 'video')
    pushImage(template.previewImageUrl)
    pushImage(template.payload.referenceImageUrl)
  } else {
    pushImage(template.previewImageUrl)
    if (template.kind === StudioTemplateKind.IMAGE) {
      for (const url of template.payload.referenceImageUrls ?? []) {
        pushImage(url)
      }
    }
  }

  return items.slice(0, max).map((item, index) => ({
    id: `${template._id}-reference-${index}`,
    url: item.url,
    kind: item.kind,
    source: 'library',
    label: 'Reference',
  }))
}
