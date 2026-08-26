import type { AttachedMedia } from '@/components/files/attach-images-dialog'
import { STATIC_AD_IMAGE_MAX, type StaticAdImageInput } from '@socialista/trigger/schemas/static-ad'

export function collectStaticAdImages(
  attachments: readonly AttachedMedia[],
  template?: { imageUrl: string; name?: string } | null,
): StaticAdImageInput[] {
  const images: StaticAdImageInput[] = []
  const seen = new Set<string>()

  for (const file of attachments) {
    if (file.kind !== 'image' || !file.url || seen.has(file.url)) continue
    seen.add(file.url)
    images.push({
      url: file.url,
      role: file.source,
      ...(file.label ? { label: file.label } : {}),
    })
    if (images.length >= STATIC_AD_IMAGE_MAX) return images
  }

  if (template?.imageUrl && !seen.has(template.imageUrl) && images.length < STATIC_AD_IMAGE_MAX) {
    images.push({
      url: template.imageUrl,
      role: 'template',
      ...(template.name ? { label: template.name } : {}),
    })
  }

  return images
}
