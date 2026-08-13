/**
 * Phase 0 spike decision: sequential start-frame chaining.
 * Independent stills drift identity/product across scenes. Still 0 is generated
 * from influencer gallery + product photos; stills 1+ take the previous still as
 * the primary image ref so the same person and SKU carry forward.
 */
export const UGC_STILL_REF_STRATEGY = 'sequential' as const

const MAX_STILL_REFS = 6

export function buildUgcStillRefUrls(input: {
  influencerReferenceUrls?: string[]
  productImageUrls?: string[]
  extraReferenceUrls?: string[]
  previousStillUrl?: string
  sceneIndex: number
}): string[] {
  const urls: string[] = []

  if (input.sceneIndex > 0 && input.previousStillUrl) {
    urls.push(input.previousStillUrl)
  }

  for (const url of input.influencerReferenceUrls ?? []) {
    if (url && !urls.includes(url)) urls.push(url)
  }

  for (const url of input.productImageUrls ?? []) {
    if (url && !urls.includes(url)) urls.push(url)
  }

  for (const url of input.extraReferenceUrls ?? []) {
    if (url && !urls.includes(url)) urls.push(url)
  }

  return urls.slice(0, MAX_STILL_REFS)
}
