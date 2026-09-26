import { ugcClipIsFreeform, ugcClipRequiresCreator, ugcClipRequiresProduct, type UgcClipType } from '@socialista/types'

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
  cta: {
    0: 'CTA start frame: the creator faces the phone camera, mid-shot, about to make a clear ask. Direct eye contact, lived-in room, not a studio smile. Product may be nearby. No on-screen text or buttons.',
  },
  demo: {
    0: 'Demo start frame: the creator is mid-use of the product — hands doing the action, SKU readable, face in frame when possible. Mouth relaxed, not mid-speech. Casual phone capture of a how-it-works moment, not a catalog pose.',
  },
  'try-on': {
    0: 'Try-on start frame: the creator is wearing or using the product on their body (apparel, jewelry, beauty, wearable). Face and product both readable. Casual phone selfie energy, not a lookbook pose.',
  },
  review: {
    0: 'Review start frame: the creator faces the phone camera, mid-shot, talking through a specific take. Lived-in room. Product can sit nearby or in hand. Honest, not a press-kit pose.',
  },
  reaction: {
    0: 'First-reaction start frame: the creator has just seen or used the product, mid-reaction — surprise, laugh, or a real look. Product in frame. Phone UGC, not a staged smile.',
  },
  'before-after': {
    0: 'Before-after start frame: the creator and product in a clear “after” or side-by-side setup the video will contrast. Face and SKU readable. Lived-in room, not a split-screen graphic or on-image text.',
  },
  'app-showcase': {
    0: 'App or website start frame: a phone or laptop in frame showing the attached UI screenshot on the screen. If a creator is present they hold the device naturally. The screen content must match the screenshot, not a generic fake UI.',
  },
  custom: {
    0: 'Freeform UGC still: follow the user scene look if they wrote one. Otherwise a natural phone-captured still from the attached refs. Keep the same person and product when those photos exist. Do not invent a new format, captions, or logos.',
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
    : ugcClipRequiresProduct(input.clipType)
      ? 'Product: the item in the product reference photo. Match it exactly.'
      : ''
  const creatorLine = input.influencerName?.trim()
    ? `Creator: ${input.influencerName.trim()}. The attached person photos ARE this creator.`
    : ugcClipRequiresCreator(input.clipType)
      ? ''
      : ugcClipIsFreeform(input.clipType)
        ? 'A person may be in frame if the user scene look asks for one, or if creator photos are attached.'
        : 'No person in frame unless the user scene look asks for hands only.'
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

export type UgcStillRefRole =
  | 'previous-still'
  | 'creator'
  | 'product'
  | 'screenshot'
  | 'user-upload'

export type UgcStillRef = {
  url: string
  role: UgcStillRefRole
}

export type UgcStillRefCategories = {
  influencerReferenceUrls?: string[]
  productImageUrls?: string[]
  extraReferenceUrls?: string[]
  extraRole?: UgcStillRefRole
  previousStillUrl?: string
}

const ROLE_LINES: Record<UgcStillRefRole, string> = {
  'previous-still':
    'previous still — lock the same person, room, wardrobe, and SKU; new angle of this scene',
  creator: 'creator — lock face, hair, age, body, skin, and clothes from this photo',
  product: 'product — lock silhouette, label, color, and materials; exact SKU',
  screenshot: 'screenshot — the device screen must match this UI, not a generic fake',
  'user-upload': 'user reference — lock the visible subject; do not redesign it',
}

function uniqueUrls(urls?: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const url of urls ?? []) {
    if (!url || seen.has(url)) continue
    seen.add(url)
    out.push(url)
  }
  return out
}

export function buildUgcStillRefs(
  input: UgcStillRefCategories & { sceneIndex?: number },
): UgcStillRef[] {
  const creators = uniqueUrls(input.influencerReferenceUrls)
  const products = uniqueUrls(input.productImageUrls)
  const extras = uniqueUrls(input.extraReferenceUrls)
  const extraRole = input.extraRole ?? 'user-upload'
  const refs: UgcStillRef[] = []
  const used = new Set<string>()

  const push = (url: string | undefined, role: UgcStillRefRole) => {
    if (!url || used.has(url) || refs.length >= MAX_STILL_REFS) return false
    used.add(url)
    refs.push({ url, role })
    return true
  }

  push(input.previousStillUrl, 'previous-still')
  push(
    products.find(url => !used.has(url)),
    'product',
  )
  push(
    creators.find(url => !used.has(url)),
    'creator',
  )

  let productCount = refs.filter(ref => ref.role === 'product').length
  let creatorCount = refs.filter(ref => ref.role === 'creator').length
  for (const url of products) {
    if (productCount >= 2) break
    if (push(url, 'product')) productCount += 1
  }
  for (const url of creators) {
    if (creatorCount >= 3) break
    if (push(url, 'creator')) creatorCount += 1
  }
  for (const url of extras) push(url, extraRole)
  for (const url of products) push(url, 'product')
  for (const url of creators) push(url, 'creator')

  return refs
}

export function labelUgcStillRefs(
  urls: string[],
  categories: UgcStillRefCategories,
): UgcStillRef[] {
  const previous = categories.previousStillUrl
  const creators = new Set(uniqueUrls(categories.influencerReferenceUrls))
  const products = new Set(uniqueUrls(categories.productImageUrls))
  const extras = new Set(uniqueUrls(categories.extraReferenceUrls))
  const extraRole = categories.extraRole ?? 'user-upload'
  const seen = new Set<string>()
  const refs: UgcStillRef[] = []

  for (const url of urls) {
    if (!url || seen.has(url) || refs.length >= MAX_STILL_REFS) continue
    seen.add(url)
    const role: UgcStillRefRole =
      url === previous
        ? 'previous-still'
        : products.has(url)
          ? 'product'
          : creators.has(url)
            ? 'creator'
            : extras.has(url)
              ? extraRole
              : 'user-upload'
    refs.push({ url, role })
  }

  return refs
}

export function buildUgcStillRefUrls(input: UgcStillRefCategories & { sceneIndex?: number }): string[] {
  return buildUgcStillRefs(input).map(ref => ref.url)
}

export function buildUgcStillEnhanceUserPrompt(input: {
  brief: string
  clipType: UgcClipType
  influencerName?: string
  identityFragment?: string
  productName?: string
  refs: UgcStillRef[]
}): string {
  const legend = input.refs
    .map((ref, index) => `Image ${index + 1}: ${ROLE_LINES[ref.role]}`)
    .join('\n')

  return [
    `User brief:\n${input.brief.trim()}`,
    `Clip type: ${input.clipType}.`,
    input.influencerName?.trim() ? `Creator: ${input.influencerName.trim()}.` : '',
    input.identityFragment?.trim() ?? '',
    input.productName?.trim() ? `Product: ${input.productName.trim()}.` : '',
    legend ? `Attached references:\n${legend}` : 'No reference images attached.',
    'Look at every attached image. Rewrite the brief into one photoreal UGC still prompt now.',
  ]
    .filter(Boolean)
    .join('\n\n')
}
