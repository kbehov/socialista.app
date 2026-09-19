import type { ModelMessage } from 'ai'

export type UgcAdPlanProductInput = {
  name?: string
  description?: string
  url?: string
  kind?: string
  imageUrls?: string[]
}

export type PlanUgcAdInput = {
  description: string
  influencerName: string
  influencerImageUrl: string
  product?: UgcAdPlanProductInput
  aspectRatio?: string
  systemOverride?: string
}

const MAX_PRODUCT_IMAGES = 3

export function buildUgcAdPlanMessages(input: PlanUgcAdInput): ModelMessage[] {
  const brief = input.description.trim()
  const product = input.product
  const productImages = (product?.imageUrls ?? []).map(url => url.trim()).filter(Boolean).slice(0, MAX_PRODUCT_IMAGES)
  const imageUrls = [input.influencerImageUrl.trim(), ...productImages].filter(Boolean)

  const productLines = product
    ? [
        product.name?.trim() ? `Product name: ${product.name.trim()}` : '',
        product.kind?.trim() ? `Product kind: ${product.kind.trim()}` : '',
        product.description?.trim() ? `Product description: ${product.description.trim()}` : '',
        product.url?.trim() ? `Product URL: ${product.url.trim()}` : '',
        productImages.length > 0
          ? `Product photos attached as Image 2${productImages.length > 1 ? `–${productImages.length + 1}` : ''}. Lock that SKU.`
          : 'No product photo attached — use the name and description only. Do not invent packaging artwork.',
      ].filter(Boolean)
    : ['No product selected. Plan a creator-led video from the brief.']

  const text = [
    `Creator: ${input.influencerName}. Image 1 is their cover portrait — lock this person in every scene that needs a face.`,
    `Aspect: ${input.aspectRatio?.trim() || '9:16'} vertical UGC unless the brief says otherwise.`,
    productLines.join('\n'),
    `User brief:\n${brief}`,
    'Plan the campaign now. Default to 3 scenes: spoken hook → proof/demo → CTA. Every on-camera talking scene must have a spoken script (max 150 chars, sized to its duration). Product b-roll, app-on-screen, and custom scenes may have an empty script.',
  ].join('\n\n')

  const imageParts = imageUrls.map(image => ({ type: 'image' as const, image }))

  return [
    {
      role: 'user',
      content: [...imageParts, { type: 'text', text }],
    },
  ]
}
