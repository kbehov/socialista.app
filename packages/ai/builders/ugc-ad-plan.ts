import type { ModelMessage } from 'ai'
import { formatUgcSceneCatalogForPrompt, type UgcClipType } from '@socialista/types'

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
  allowedTypes?: readonly UgcClipType[]
  hasProduct?: boolean
}

const MAX_PRODUCT_IMAGES = 3

export function ugcAdPlanHasProduct(product?: UgcAdPlanProductInput): boolean {
  if (!product) return false
  return Boolean(
    product.name?.trim() ||
      product.description?.trim() ||
      product.url?.trim() ||
      product.kind?.trim() ||
      (product.imageUrls ?? []).some(url => url.trim()),
  )
}

export function buildUgcAdPlanMessages(input: PlanUgcAdInput): ModelMessage[] {
  const brief = input.description.trim()
  const product = input.product
  const productImages = (product?.imageUrls ?? []).map(url => url.trim()).filter(Boolean).slice(0, MAX_PRODUCT_IMAGES)
  const imageUrls = [input.influencerImageUrl.trim(), ...productImages].filter(Boolean)
  const hasProduct = input.hasProduct ?? ugcAdPlanHasProduct(product)
  const allowedTypes = input.allowedTypes

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

  const catalogBlock = allowedTypes?.length
    ? [
        'Available scene types — type must be one of these slugs. Never invent a new type or a creative scene title (not "text thread chaos", not "bathroom confession"). The UI labels them Talking head, App on screen, etc.',
        formatUgcSceneCatalogForPrompt(allowedTypes),
      ].join('\n')
    : ''

  const constraintLine = hasProduct
    ? product?.kind === 'app' || product?.kind === 'website'
      ? 'This product is an app or site. Prefer app-showcase as the proof beat unless the brief is clearly talking-only.'
      : ''
    : 'Product scenes are off the table — no product was selected. Do not plan product-hold, b-roll, unboxing, demo, try-on, reaction, before-after, or app-showcase.'

  const text = [
    `Creator: ${input.influencerName}. Image 1 is their cover portrait — lock this person in every scene that needs a face.`,
    `Aspect: ${input.aspectRatio?.trim() || '9:16'} vertical UGC unless the brief says otherwise.`,
    productLines.join('\n'),
    catalogBlock,
    constraintLine,
    `User brief:\n${brief}`,
    'Plan the campaign now. Default to 3 scenes using catalog slugs only: hook → proof/demo → cta. Every on-camera talking scene must have a spoken script (talking-head max 300 chars, other talking scenes max 150, sized to duration). Product b-roll, app-on-screen, and custom scenes may have an empty script.',
  ]
    .filter(Boolean)
    .join('\n\n')

  const imageParts = imageUrls.map(image => ({ type: 'image' as const, image }))

  return [
    {
      role: 'user',
      content: [...imageParts, { type: 'text', text }],
    },
  ]
}
