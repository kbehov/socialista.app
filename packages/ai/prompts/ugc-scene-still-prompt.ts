export type UgcSceneStillPromptInput = {
  sceneIndex: number
  sceneCount: number
  influencerName: string
  identityFragment: string
  productName?: string
  directions?: string
}

const SCENE_BEATS: Record<number, string> = {
  0: 'Start-frame hero: the creator faces camera, mid-shot, holding or presenting the product naturally — phone UGC, kitchen/desk/lifestyle, not a studio catalog pose.',
  1: 'Second beat: tighter on the product in their hands — same person, same outfit, same room. Show the SKU clearly (label, color, shape) while they use or inspect it.',
  2: 'Third beat: a slightly different angle of the same moment — over-shoulder or 3/4, still the same creator and the same product. No new wardrobe, no new location.',
}

export const UGC_SCENE_STILL_SYSTEM = `
You are generating a photoreal UGC still that will be the start frame of a short-form video ad.

IDENTITY LOCK
- The person in the reference photos IS this creator. Same face, hair, age, body, skin.
- Do not beautify into a different person. Do not swap gender or ethnicity.

PRODUCT LOCK
- The product photo is ground truth. Same silhouette, label, color, cap, materials.
- They must be holding or presenting THAT product, not a generic bottle or box.
- Do not invent a different SKU.

LOOK
- Casual smartphone UGC: slight wide-angle, natural HDR, lived-in room, scroll-stopping authenticity.
- Vertical 9:16. No logos, watermarks, captions, or UI chrome on the image.
- Natural hands, believable grip, contact shadows. Not a floating product composite.
`.trim()

export function buildUgcSceneStillPrompt(input: UgcSceneStillPromptInput): string {
  const beat = SCENE_BEATS[input.sceneIndex] ?? SCENE_BEATS[0]
  const productLine = input.productName?.trim()
    ? `Product: ${input.productName.trim()}.`
    : 'Product: the item in the product reference photo.'
  const directions = input.directions?.trim()
    ? `User direction: ${input.directions.trim()}.`
    : ''

  return [
    `Creator: ${input.influencerName}.`,
    input.identityFragment,
    productLine,
    `Scene ${input.sceneIndex + 1} of ${input.sceneCount}. ${beat}`,
    directions,
    'Photoreal UGC still, 9:16, no text overlay, no watermark.',
  ]
    .filter(Boolean)
    .join('\n')
}
