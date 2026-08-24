import type { UgcClipType } from '@socialista/types'
export type UgcSceneStillPromptInput = {
  clipType: UgcClipType
  sceneIndex: number
  sceneCount: number
  influencerName?: string
  identityFragment?: string
  productName?: string
  scenePrompt?: string
}

const BEATS: Record<UgcClipType, Record<number, string>> = {
  talking: {
    0: 'Talking-head start frame: the creator faces the phone camera, mid-shot, natural expression mid-sentence. Lived-in room. Product may be nearby but does not have to be in hand.',
  },
  'product-hold': {
    0: 'Start-frame hero: the creator faces camera, mid-shot, holding or presenting the product naturally — phone UGC, kitchen/desk/lifestyle, not a studio catalog pose.',
    1: 'Tighter on the product in their hands — same person, same outfit, same room. Show the SKU clearly (label, color, shape) while they use or inspect it.',
    2: 'A slightly different angle of the same moment — over-shoulder or 3/4, still the same creator and the same product.',
  },
  'b-roll': {
    0: 'Product-only beauty still: the SKU fills the frame in a real lifestyle setting. No person unless the user asked. Macro texture, honest materials, natural light. Not a floating catalog composite.',
  },
  unboxing: {
    0: 'Unboxing start frame: the creator sits with the sealed box or mailer in their lap or on a table, looking at camera, about to open it. Same product packaging as the reference.',
    1: 'Reveal beat: the product is coming out of the box in their hands. Same person, same room, same outfit. SKU clearly visible.',
  },
  'try-on': {
    0: 'Try-on start frame: the creator is wearing or using the product on their body (apparel, jewelry, beauty, wearable). Face and product both readable. Casual phone selfie energy, not a lookbook pose.',
  },
  'app-showcase': {
    0: 'App showcase start frame: a phone or device in frame showing the attached UI screenshot on the screen. If a creator is present they hold the phone naturally. The screen content must match the screenshot, not a generic fake UI.',
  },
}

export const UGC_STILL_LOCK_FOOTER = `
Keep the exact same person as the attached creator photos (face, hair, age, body, skin — do not beautify into someone else). Keep the exact same product as the product photos (silhouette, label, color, materials — do not swap the SKU). No watermarks, captions, logos, or AI-generated text labels.
`.trim()

export function buildUgcSceneStillPrompt(input: UgcSceneStillPromptInput): string {
  const typeBeats = BEATS[input.clipType]
  const beat = typeBeats[input.sceneIndex] ?? typeBeats[0] ?? BEATS['product-hold'][0]!
  const productLine = input.productName?.trim()
    ? `Product: ${input.productName.trim()}. The attached product photos are ground truth.`
    : input.clipType === 'talking'
      ? ''
      : 'Product: the item in the product reference photo. Match it exactly.'
  const creatorLine = input.influencerName?.trim()
    ? `Creator: ${input.influencerName.trim()}. The attached person photos ARE this creator.`
    : input.clipType === 'b-roll'
      ? 'No person in frame unless the user scene look asks for hands only.'
      : ''
  const look = input.scenePrompt?.trim() ? `User scene look: ${input.scenePrompt.trim()}.` : ''

  return [
    creatorLine,
    input.identityFragment?.trim() ?? '',
    productLine,
    `Clip type: ${input.clipType}. Scene ${input.sceneIndex + 1} of ${input.sceneCount}. ${beat}`,
    look,
    'Photoreal UGC still. Describe only what is in the frame. No on-image text.',
  ]
    .filter(Boolean)
    .join('\n')
}

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
