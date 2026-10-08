import type { AspectRatio, StaticAdCopyInput, StaticAdTemplateBlueprint } from '@socialista/types'
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
  /** Precomputed template contract. Used only when a template image is attached. */
  templateBlueprint?: StaticAdTemplateBlueprint | null
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
      return 'ad template to edit in place — keep concept, person, colors, layout, and type; change only what the notes name'
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
    '- If an ad template is present, edit that image in place. Keep its concept, person, colors, and layout. Swap the product only when a product reference is attached. Swap the person only when a person reference is attached or the notes ask for them.',
    '- Extra unlabeled refs can be more products, more people, a location, lighting, wardrobe, or style. Use them. Do not ignore them.',
    '- If the user tagged @imageN, that mapping is ground truth.',
    '- If the notes do not ask for a new person or product, keep the ones already in the template.',
  ].join('\n')
}

function hasTemplateImage(images: readonly StaticAdImageInput[]): boolean {
  return images.some((image) => image.role === 'template')
}

function formatAdCopy(adCopy?: StaticAdCopyInput): string | null {
  if (!adCopy) return null
  const lines: string[] = []
  if (adCopy.headline?.trim()) lines.push(`headline "${adCopy.headline.trim()}"`)
  if (adCopy.subheadline?.trim()) lines.push(`subheadline "${adCopy.subheadline.trim()}"`)
  if (adCopy.cta?.trim()) lines.push(`CTA "${adCopy.cta.trim()}"`)
  if (adCopy.brandName?.trim()) lines.push(`brand "${adCopy.brandName.trim()}"`)
  if (lines.length === 0) return null
  return ['Required on-image copy (verbatim — do not rewrite):', ...lines].join('\n')
}

export function formatTemplateBlueprint(blueprint: StaticAdTemplateBlueprint): string {
  const palette = blueprint.palette
    .map((swatch) => `${swatch.hex} (${swatch.role})`)
    .join(', ')
  const lines = [
    'Template blueprint (ground truth for layout, type hierarchy, and palette roles; use the template image for fine detail):',
    `- Format: ${blueprint.format}`,
    `- Layout: ${blueprint.layout}`,
    `- Type hierarchy: ${blueprint.typeHierarchy}`,
    `- Palette roles: ${palette || 'infer from the template image and keep those colors'}`,
    `- Hook style: ${blueprint.hookStyle} (the existing headline's pattern — translate it, do not replace the concept)`,
    `- Scene job: ${blueprint.sceneJob}`,
  ]
  if (blueprint.aspectRatioHint) {
    lines.push(`- Aspect hint: ${blueprint.aspectRatioHint}`)
  }
  lines.push(
    'Blueprint hex values are the template colors to keep. Do not recolor the layout to the new product. Translate the existing headline; do not write a new concept.',
  )
  return lines.join('\n')
}

const TEMPLATE_RECREATION_BRIEF = [
  'Template edit is on. The template image is the picture to edit, not a moodboard.',
  'Keep its concept, person, pose, background, graphic colors, frame, and type placement.',
  "Do not recolor the layout to the new product's palette. The new pack keeps its own colors.",
  'Replace the product only when a product reference or the notes ask for it.',
  'Replace the person only when a person reference is attached or the notes ask for a different person.',
  'Translate concept, joke, and offer lines that still fit the new product. Replace lines that name the template product or list its features, ingredients, or use case with the new product facts, in the same slots.',
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
    if (input.templateBlueprint) {
      parts.push(formatTemplateBlueprint(input.templateBlueprint))
    }
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

  const verbatimCopy = formatAdCopy(input.adCopy)
  if (verbatimCopy) {
    parts.push(verbatimCopy)
  }

  const count = input.count && input.count > 1 ? input.count : 1
  if (count > 1) {
    parts.push(
      templated
        ? [
            `Creative count: ${count} attempts of the SAME template edit — same concept, person, colors, layout, and translated copy.`,
            'Do not invent a new scene or a new headline.',
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
      ? `Task: Analyze every attached image and write ${promptCount} in Mode/Scene/Copy/Lock format${perPromptBudget}${delimiterHint}. Edit the template in place. Keep concept, person, colors, and layout. Change only what the notes and language require${hookSuffix}. Translate existing copy; do not invent a new hook.${noAlternatives}`
      : `Task: Analyze every attached image and write ${promptCount} in Mode/Scene/Copy/Lock format${perPromptBudget}${delimiterHint}. Do not transcribe packaging. Distinctive thumb-stop, exact identities from the refs, scroll-stopping hook. Must not look like a default ChatGPT/Gemini ad.${noAlternatives}`,
  )

  return parts.join('\n\n')
}

export function buildStaticAdRecreateCritiqueTurn(input: {
  drafts: readonly string[]
  blueprint?: StaticAdTemplateBlueprint | null
  count: number
  notes?: string
  adCopy?: StaticAdCopyInput
}): string {
  const count = input.count > 1 ? Math.floor(input.count) : 1
  const parts = [
    `Revise these ${count} draft prompt${count > 1 ? 's' : ''}. Return ${count} Mode/Scene/Copy/Lock block${count > 1 ? 's' : ''}.`,
  ]
  if (count > 1) {
    parts.push(
      `Separate blocks with a line containing only "${STATIC_AD_CREATIVE_DELIMITER}". Keep every headline unique.`,
    )
  }
  if (input.blueprint) {
    parts.push(formatTemplateBlueprint(input.blueprint))
  }
  const notes = input.notes?.trim()
  if (notes) {
    parts.push(`Marketer notes (keep this intent):\n${notes}`)
  }
  const verbatimCopy = formatAdCopy(input.adCopy)
  if (verbatimCopy) {
    parts.push(verbatimCopy)
  }
  parts.push(
    [
      'Draft prompts:',
      input.drafts.join(`\n${STATIC_AD_CREATIVE_DELIMITER}\n`),
    ].join('\n'),
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

/** Template first, then the references that may replace something in it. */
export function orderStaticAdTemplateEditImages(
  images: readonly StaticAdImageInput[],
): StaticAdImageInput[] {
  return [
    ...images.filter((image) => image.role === 'template'),
    ...images.filter((image) => image.role !== 'template'),
  ]
}

function remapAtImageTags(
  notes: string,
  from: readonly StaticAdImageInput[],
  to: readonly StaticAdImageInput[],
): string {
  return notes.replace(/@image(\d+)/gi, (tag, raw: string) => {
    const source = from[Number(raw) - 1]
    if (!source) return tag
    const next = to.findIndex(
      (image) => image.url === source.url && image.role === source.role,
    )
    return next < 0 ? tag : `@image${next + 1}`
  })
}

function namedImages(
  images: readonly StaticAdImageInput[],
  match: (image: StaticAdImageInput) => boolean,
): string {
  return images
    .flatMap((image, index) => (match(image) ? [imageName(index)] : []))
    .join(' and ')
}

export type StaticAdTemplateProductFact = {
  /** Image N in the edit order, e.g. "Image 2". */
  image: string
  name: string
  description?: string
}

/**
 * User turn for a template edit. The image model edits the template in place.
 * The picture stays. Product-specific lines are rewritten from the new product.
 */
export function buildStaticAdTemplateEditRequest(
  input: Pick<StaticAdPromptInput, 'prompt' | 'language' | 'adCopy' | 'images'> & {
    products?: readonly StaticAdTemplateProductFact[]
  },
): string {
  const ordered = orderStaticAdTemplateEditImages(input.images)
  const templateNames = namedImages(ordered, (image) => image.role === 'template')
  const productNames = namedImages(ordered, (image) => image.role === 'product')
  const personNames = namedImages(ordered, (image) => image.role === 'influencer')
  const languageLabel = getAdLanguageLabel(input.language ?? 'en')

  const lines = [
    `Edit ${templateNames || 'the template image'} in place. It is a finished static ad.`,
    'Keep the concept, joke, scene, person, face, pose, expression, wardrobe, background color, graphic colors, type color, frame, logo placement, and type placement.',
    'Do not recolor the layout to match a new product. Do not invent a new scene because the new product is a different category.',
  ]

  if (productNames) {
    lines.push(
      `Replace only the product with the exact product from ${productNames}. Same hand, position, and scale. The new pack keeps its own label and colors. The rest of the ad keeps the template colors.`,
    )
  }

  if (personNames) {
    lines.push(
      `Replace the person with the exact person from ${personNames}. Keep the same pose, crop, and setting unless the notes say otherwise.`,
    )
  } else {
    lines.push('Keep the person already in the template. Do not cast a different model.')
  }

  const productFacts = (input.products ?? []).filter((product) => product.name.trim())
  if (productFacts.length > 0) {
    lines.push(
      [
        "New product info — the only source for the new product's name, features, ingredients, and use case. Do not use the template product's claims.",
        ...productFacts.map((product) => {
          const description = product.description?.trim()
          return `- ${product.image}: ${product.name.trim()}${description ? `. ${description}` : ''}`
        }),
      ].join('\n'),
    )
  }

  const verbatim = formatAdCopy(input.adCopy)
  if (verbatim) {
    lines.push(
      `Replace the on-image marketing lines with this copy, same placement and weight:\n${verbatim}`,
    )
  } else if (productNames || productFacts.length > 0) {
    lines.push(
      [
        `On-image copy in ${languageLabel}. Same placement and about the same line count.`,
        'Keep and translate lines that are the concept, joke, offer, or reaction and that still make sense for the new product.',
        "Replace lines that name the template product or list its features, ingredients, benefits, or use case. Write the new product's real features in those same slots.",
        'Do not invent features that are not in the product info, on the pack, or in the notes. Do not invent a new concept.',
      ].join(' '),
    )
  } else {
    lines.push(
      `Translate the template's existing headline, subline, and CTA into ${languageLabel}. Same meaning, line count, emphasis, and placement. Do not invent a new concept or new product features.`,
    )
  }

  const notes = input.prompt?.trim()
  if (notes) {
    lines.push(
      `User request — apply only the changes it names. Everything else stays:\n${remapAtImageTags(notes, input.images, ordered)}`,
    )
  }

  return lines.join('\n\n')
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
      `Edit ${templateLock} in place. Keep its concept, person, background, graphic colors, and type placement. Change only the product or copy the notes name. Do not recolor the layout.`,
    )
  }
  if (parts.length === 0) {
    parts.push(
      'Lock identities from the attached references. Distinctive Meta static ad, not a generic AI shot.',
    )
  }

  return `${parts.join(' ')}\n\n${plannedPrompt}`
}
