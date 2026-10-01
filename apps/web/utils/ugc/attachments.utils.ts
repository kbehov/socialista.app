import type { AttachedMedia } from '@/components/files/attach-images-dialog'
import { ugcClipGeneratedStills } from '@/lib/studio/ugc/ugc-stage'
import {
  ugcClipRequiresProduct,
  ugcClipRequiresScreenshots,
  ugcResolvedInfluencerId,
  type UgcClip,
  type UgcProject,
} from '@socialista/types'

type InfluencerLookup = Record<
  string,
  { coverImageUrl?: string; galleryImageUrls: string[]; name: string }
>

export function stillUrlsToAttachments(urls: string[]): AttachedMedia[] {
  return urls.slice(0, 3).map((url, index) => ({
    id: `still-${index}-${url}`,
    url,
    kind: 'image' as const,
    source: 'library' as const,
    label: index === 0 ? 'Start frame' : `Still ${index + 1}`,
    name: 'Scene still',
  }))
}

export function clipStillsToAttachments(
  clip: UgcClip | undefined,
  productImageUrls: string[] = [],
): AttachedMedia[] {
  if (!clip) return []
  const urls = ugcClipGeneratedStills(clip, productImageUrls)
    .flatMap(still => (still.imageUrl ? [still.imageUrl] : []))
    .slice(0, 3)
  return stillUrlsToAttachments(urls)
}

export function ugcCampaignAttachments(
  project: UgcProject,
  clip: UgcClip,
  influencersById: InfluencerLookup,
): AttachedMedia[] {
  const items: AttachedMedia[] = []
  const influencerId = ugcResolvedInfluencerId(project, clip)
  const creator = influencerId ? influencersById[influencerId] : undefined
  const creatorSrc = creator?.coverImageUrl || creator?.galleryImageUrls[0]
  if (creatorSrc && influencerId) {
    items.push({
      id: `creator-${influencerId}`,
      url: creatorSrc,
      kind: 'image',
      source: 'influencer',
      label: creator?.name ?? 'Creator',
      influencerId,
    })
  }
  if (ugcClipRequiresScreenshots(clip.type)) {
    const screenUrls = [
      ...(clip.referenceImageUrls ?? []),
      ...(project.productKind === 'app' || project.productKind === 'website'
        ? project.productImageUrls
        : []),
    ]
    const seen = new Set<string>()
    for (const url of screenUrls) {
      if (!url || seen.has(url)) continue
      seen.add(url)
      items.push({
        id: `screen-${url}`,
        url,
        kind: 'image',
        source: 'library',
        label: 'Screenshot',
      })
    }
  } else if (ugcClipRequiresProduct(clip.type)) {
    const productSrc = project.productImageUrls[0]
    if (productSrc) {
      items.push({
        id: `product-${productSrc}`,
        url: productSrc,
        kind: 'image',
        source: 'product',
        label: project.productName ?? 'Product',
        productId: project.productId,
      })
    }
  }
  return items.slice(0, 3)
}

export function assetImageAttachment(url: string): AttachedMedia {
  return {
    id: `asset-${url}`,
    url,
    kind: 'image',
    source: 'library',
    label: 'Reused still',
    name: 'Scene still',
  }
}
