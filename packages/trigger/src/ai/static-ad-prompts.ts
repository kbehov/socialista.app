import type { AspectRatio, StaticAdCopyInput } from '@socialista/types'
import { getAdLanguageLabel } from '@socialista/types'

import type { StaticAdImageInput } from '../schemas/static-ad.schema.js'

export type StaticAdPromptInput = {
  /** Freeform marketer notes — direction, context, copy, tone, constraints, or any mix. Optional. */
  prompt?: string
  language?: string
  aspectRatio?: AspectRatio
  /** Structured copy fields (legacy / optional). Prefer extracting copy from freeform notes when present. */
  adCopy?: StaticAdCopyInput
  images: StaticAdImageInput[]
  /** How many distinct creatives to plan. Defaults to 1. */
  count?: number
}

export const STATIC_AD_CREATIVE_DELIMITER = '===-CREATIVE-==='

const ASPECT_RATIO_GUIDANCE: Record<AspectRatio, string> = {
  '1:1':
    '1:1 Instagram/Facebook feed — phone tile in a noisy scroll. One silhouette that reads at thumbnail size; hero + type in the center safe zone; no poster margins.',
  '9:16':
    '9:16 Stories/Reels — full-bleed phone screen. Hook → product → CTA stacked in the middle ~60% (clear of top UI and bottom chrome). Intimate framing.',
  '16:9':
    '16:9 landscape feed — still social, not cinema billboard. Keep subject large on mobile landscape; avoid wide empty cinematic margins.',
  '4:3':
    '4:3 feed/carousel — product-forward mobile hierarchy; short headline + CTA without poster-scale negative space.',
}

/**
 * Used when the marketer leaves notes empty.
 * Must invent a distinctive concept — never ChatGPT/Gemini default AI ads.
 */
const NO_NOTES_BRIEF = [
  'Marketer notes: NONE — invent the entire concept from the attached references.',
  "HARD BAN (specific overused combos, not drama/polish itself): velvet/curtain product reveal with gold rim-light halo, black reflective luxury void, centered bottle on a glowing pedestal, black+gold 'luxury supplement' theater as the whole idea, generic sparkle/smoke/lens-flare filler, chrome 3D lettering and badge spam.",
  "Invent one unexpected, category-true thumb-stop that a stranger has not seen 100 times today — this can be authentic phone UGC OR a genuinely ambitious professional/cinematic concept. Pick whichever fits the product category better; do not default to UGC just to seem 'safe'.",
  "Prefer: bold graphic disruption, surprising real-world moment, material metaphor that is NOT velvet/gold/marble, authentic phone UGC, or a specific high-production cinematic idea (splash freeze, levitation, macro texture, one surreal rule) — never generic AI luxury theater and never a watered-down 'safe' compromise.",
  'Invent a scroll-stopping hook in the requested language (3–8 words, specific, not a category caption). Lean hierarchy: hook + product + optional CTA.',
].join(' ')

function imageName(index: number): string {
  return `Image ${index + 1}`
}

function roleLegend(role: StaticAdImageInput['role']): string {
  switch (role) {
    case 'product':
      return 'product — lock pack identity (shape, label, logo, colors)'
    case 'influencer':
      return 'person / influencer — lock face, body, hair, and identity'
    case 'template':
      return 'ad template to recreate — layout, composition, type, lighting, and scene job only; not product/person identity'
    case 'upload':
    case 'library':
      return 'unlabeled reference — infer from pixels (person, product, setting, style, extra SKU, or a finished ad)'
    default:
      return 'reference — infer from pixels and notes'
  }
}

export function buildStaticAdImageLegend(
  images: readonly StaticAdImageInput[],
): string {
  const lines = images.map((image, index) => {
    const name = imageName(index)
    const tag = `@image${index + 1}`
    const label = image.label ? ` — "${image.label}"` : ''
    return `- ${name} (${tag}): ${roleLegend(image.role)}${label}`
  })

  return [
    'Attached references, in order. @imageN in marketer notes maps to Image N. In your output write "Image 1" / "Image 2", never the @ tag.',
    ...lines,
    '',
    'Match flexibly — you are not limited to one product or one person:',
    '- Look at every photo. Roles are hints; pixels and @image tags win.',
    "- If an ad template is present, recreate its layout and the *job* of the scene (e.g. a girl holding a skincare bottle). Substitute the user's influencer(s) for people in the template and the user's product(s) for products in the template. Do not copy the template model's face or the template brand/pack.",
    '- Extra unlabeled refs can be more products, more people, a location, lighting, wardrobe, or style. Use them. Do not ignore them.',
    '- If the user tagged @imageN, that mapping is ground truth.',
    "- If a template role has no matching identity ref, use a generic fitting stand-in — never the template's identifiable person or branded pack.",
  ].join('\n')
}

function hasTemplateImage(images: readonly StaticAdImageInput[]): boolean {
  return images.some((image) => image.role === 'template')
}

const TEMPLATE_RECREATION_BRIEF = [
  "Template recreation is on. Recreate the template's layout, type hierarchy, lighting mood, and text placement — do not transcribe it pixel by pixel.",
  "Recolor graphic fields, backgrounds, and type accents to the user's product palette. Native UI chrome stays accurate in screenshot/UI mode.",
  "The template is composition, not identity. User product photos are the only pack/brand source. User influencer/person photos are the only people to lock. Never carry over the template's product, logo, or model.",
  'Rewrite all on-image copy as a new scroll-stopping hook for THIS product. Keep template type size/placement; do not translate the template headline. Use marketer notes verbatim when they supply copy.',
].join(' ')

/**
 * Deterministic text brief sent to the vision planner alongside reference images.
 */
export function buildStaticAdCreativeBrief(input: StaticAdPromptInput): string {
  const parts: string[] = []
  const aspectRatio = input.aspectRatio ?? '1:1'
  parts.push(
    `Target format: ${aspectRatio} — ${ASPECT_RATIO_GUIDANCE[aspectRatio]}`,
  )

  const language = input.language ?? 'en'
  const languageLabel = getAdLanguageLabel(language)
  parts.push(
    `On-image text language: ${languageLabel}. All visible marketing text must be in ${languageLabel}.`,
  )

  if (input.images.length > 0) {
    parts.push(buildStaticAdImageLegend(input.images))
  }

  const templated = hasTemplateImage(input.images)
  if (templated) {
    parts.push(TEMPLATE_RECREATION_BRIEF)
  }

  const notes = input.prompt?.trim()
  if (notes) {
    parts.push(
      [
        'Marketer notes (direction, context, copy, tone, and/or constraints).',
        'Parse and honor useful intent. Extract clearly stated headline / subheadline / CTA / brand as verbatim on-image copy.',
        'If notes conflict with product/person fidelity, keep fidelity; adapt the creative.',
        '',
        notes,
      ].join('\n'),
    )
  } else if (!templated) {
    parts.push(NO_NOTES_BRIEF)
  }

  const count = input.count && input.count > 1 ? input.count : 1
  if (count > 1) {
    parts.push(
      templated
        ? [
            `Creative count: ${count} DISTINCT recreations of the template — same layout, type hierarchy, and lighting mood in every one.`,
            'Vary everything else per creative: a different scroll-stopping hook, a different crop/angle or supporting moment, different prop/set detail. Never the same headline twice.',
          ].join(' ')
        : [
            `Creative count: ${count} DISTINCT ad creatives.`,
            'If the marketer notes clearly request ONE format/mode (e.g. unboxing, UGC selfie, screenshot, meme), keep every creative in that mode and vary within it: different specific moment, angle, scene detail, and hook — never rephrasings of one idea.',
            'Only when the notes give no format signal, spread creatives across different modes (e.g. one UGC, one PROFESSIONAL/CINEMATIC, one GRAPHIC/LAYOUT or DEMO/UNBOXING), each with its own hook.',
          ].join(' '),
    )
  }

  const delimiterHint =
    count > 1
      ? `, separated by a line containing only "${STATIC_AD_CREATIVE_DELIMITER}"`
      : ''
  const promptCount =
    count > 1
      ? `${count} SHORT image-edit prompts`
      : 'one SHORT image-edit prompt'
  const perPromptBudget =
    count > 1
      ? ' (90–160 words excluding quoted copy each)'
      : ' (90–160 words excluding quoted copy)'
  const hookSuffix = count > 1 ? ' per creative' : ''
  const noAlternatives = count > 1 ? '' : ' No alternatives.'

  parts.push(
    templated
      ? `Task: Analyze every attached image and write ${promptCount} in Mode/Scene/Copy/Lock format${perPromptBudget}${delimiterHint}. Recreate the template layout with the user's people and products mapped onto the template roles. New scroll-stopping hook${hookSuffix}, not a translated caption. Do not transcribe packaging or the template. Distinctive thumb-stop, exact identities.${noAlternatives}`
      : `Task: Analyze every attached image and write ${promptCount} in Mode/Scene/Copy/Lock format${perPromptBudget}${delimiterHint}. Do not transcribe packaging. Distinctive thumb-stop, exact identities from the refs, scroll-stopping hook. Must not look like a default ChatGPT/Gemini ad.${noAlternatives}`,
  )

  return parts.join('\n\n')
}

/**
 * Minimal assembler for callers that send a prompt directly to an image provider.
 */
export function buildStaticAdFinalPrompt(input: StaticAdPromptInput): string {
  const parts: string[] = []
  const notes = input.prompt?.trim()

  if (notes) {
    parts.push(`Marketer notes:\n${notes}`)
  } else {
    parts.push(NO_NOTES_BRIEF)
  }

  if (input.images.length > 0) {
    parts.push(buildStaticAdImageLegend(input.images))
  }

  if (input.aspectRatio) {
    parts.push(
      `Target format: ${input.aspectRatio} — ${ASPECT_RATIO_GUIDANCE[input.aspectRatio]}`,
    )
  }

  const language = input.language ?? 'en'
  parts.push(
    `All on-image marketing text must be in ${getAdLanguageLabel(language)}.`,
  )

  return parts.join('\n\n')
}

const COMPACT_SECTION_MARKERS = ['Mode:', 'Scene:', 'Copy:', 'Lock:'] as const
const LEGACY_SECTION_MARKERS = [
  'Concept:',
  'Scene:',
  'Composition:',
  'Light & grade:',
  'Typography:',
  'Preserve:',
  'Constraints:',
] as const

function hasAllMarkers(text: string, markers: readonly string[]): boolean {
  return markers.every((marker) => text.includes(marker))
}

function isValidPlannedPrompt(text: string): boolean {
  return (
    hasAllMarkers(text, COMPACT_SECTION_MARKERS) ||
    hasAllMarkers(text, LEGACY_SECTION_MARKERS)
  )
}

export function sanitizeStaticAdModelPrompts(
  raw: string,
  expectedCount = 1,
): string[] {
  const trimmed = raw
    .trim()
    .replace(/^```(?:text)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  if (!trimmed) {
    throw new Error('Static ad prompt planning returned an empty response.')
  }

  const blocks = trimmed
    .split(STATIC_AD_CREATIVE_DELIMITER)
    .map((block) => block.trim())
    .filter(Boolean)

  const valid = blocks.filter(isValidPlannedPrompt)
  if (valid.length === 0) {
    throw new Error(
      'Static ad prompt planning returned an invalid format (expected Mode/Scene/Copy/Lock).',
    )
  }

  const count =
    Number.isFinite(expectedCount) && expectedCount > 1
      ? Math.floor(expectedCount)
      : 1
  return valid.slice(0, Math.max(count, 1))
}

function namedImages(
  images: readonly StaticAdImageInput[],
  match: (image: StaticAdImageInput) => boolean,
): string {
  return images
    .flatMap((image, index) => (match(image) ? [imageName(index)] : []))
    .join(' and ')
}

export function assembleStaticAdImagePrompt(
  plannedPrompt: string,
  images: readonly StaticAdImageInput[],
): string {
  const productLock = namedImages(images, (image) => image.role === 'product')
  const personLock = namedImages(images, (image) => image.role === 'influencer')
  const templateLock = namedImages(images, (image) => image.role === 'template')

  const parts: string[] = []
  if (productLock) parts.push(`Exact product identity from ${productLock}.`)
  if (personLock) parts.push(`Exact person identity from ${personLock}.`)
  if (templateLock) {
    parts.push(
      `Recreate ${templateLock} layout, type hierarchy, and lighting. Map the user's products and people onto those roles. Recolor to the user's pack palette — not the template's product, brand, logo, or model.`,
    )
  }
  if (parts.length === 0) {
    parts.push(
      'Lock identities from the attached references. Distinctive Meta static ad, not a generic AI shot.',
    )
  }

  return `${parts.join(' ')}\n\n${plannedPrompt}`
}
