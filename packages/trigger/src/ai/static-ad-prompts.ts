import type { AspectRatio, StaticAdCopyInput } from '@socialista/types'
import { getAdLanguageLabel } from '@socialista/types'

export type StaticAdPromptInput = {
  /** Freeform marketer notes — direction, context, copy, tone, constraints, or any mix. Optional. */
  prompt?: string
  language?: string
  aspectRatio?: AspectRatio
  /** Structured copy fields (legacy / optional). Prefer extracting copy from freeform notes when present. */
  adCopy?: StaticAdCopyInput
  /** When true, Image 2 is a reference ad to recreate — not a second product. */
  hasReferenceImage?: boolean
}

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
  'Marketer notes: NONE — invent the entire concept from Image 1 only.',
  "HARD BAN (specific overused combos, not drama/polish itself): velvet/curtain product reveal with gold rim-light halo, black reflective luxury void, centered bottle on a glowing pedestal, black+gold 'luxury supplement' theater as the whole idea, generic sparkle/smoke/lens-flare filler, chrome 3D lettering and badge spam.",
  "Invent one unexpected, category-true thumb-stop that a stranger has not seen 100 times today — this can be authentic phone UGC OR a genuinely ambitious professional/cinematic concept. Pick whichever fits the product category better; do not default to UGC just to seem 'safe'.",
  "Prefer: bold graphic disruption, surprising real-world moment, material metaphor that is NOT velvet/gold/marble, authentic phone UGC, or a specific high-production cinematic idea (splash freeze, levitation, macro texture, one surreal rule) — never generic AI luxury theater and never a watered-down 'safe' compromise.",
  'Invent a scroll-stopping hook in the requested language (3–8 words, specific, not a category caption). Lean hierarchy: hook + product + optional CTA.',
].join(' ')

const TEMPLATE_RECREATION_BRIEF = [
  'Template recreation: Image 2 is a reference ad to recreate. Match its layout, type hierarchy, lighting mood, and text placement — do not transcribe it pixel by pixel.',
  "Recolor the ad to Image 1's product palette (backgrounds, graphic fills, type accents, set dressing). Do not keep Image 2's brand colors when they clash with the pack. Native UI chrome stays accurate in screenshot/UI mode.",
  'Image 1 is the ONLY source of product identity — never carry over the reference product, brand, or logo.',
  'Rewrite all on-image copy as a new scroll-stopping hook for THIS product. Keep Image 2 type size/placement; do not translate the reference headline. Use marketer notes verbatim when they supply copy.',
  'If a human/model appears in the reference, recreate the pose/framing with a fitting generic person.',
].join(' ')

/**
 * Deterministic text brief sent to the vision planner alongside the product image.
 */
export function buildStaticAdCreativeBrief(input: StaticAdPromptInput): string {
  const parts: string[] = []
  const aspectRatio = input.aspectRatio ?? '1:1'
  parts.push(`Target format: ${aspectRatio} — ${ASPECT_RATIO_GUIDANCE[aspectRatio]}`)

  const language = input.language ?? 'en'
  const languageLabel = getAdLanguageLabel(language)
  parts.push(`On-image text language: ${languageLabel}. All visible marketing text must be in ${languageLabel}.`)

  if (input.hasReferenceImage) {
    parts.push(TEMPLATE_RECREATION_BRIEF)
  }

  const notes = input.prompt?.trim()
  if (notes) {
    parts.push(
      [
        'Marketer notes (direction, context, copy, tone, and/or constraints).',
        'Parse and honor useful intent. Extract clearly stated headline / subheadline / CTA / brand as verbatim on-image copy.',
        'If notes conflict with product fidelity, keep fidelity; adapt the creative.',
        '',
        notes,
      ].join('\n'),
    )
  } else if (!input.hasReferenceImage) {
    parts.push(NO_NOTES_BRIEF)
  }

  parts.push(
    input.hasReferenceImage
      ? 'Task: Analyze Image 1 (product) and Image 2 (reference ad) and write one SHORT image-edit prompt in Mode/Scene/Copy/Lock format (90–160 words excluding quoted copy). Recreate Image 2 layout with Image 1 product and Image 1 palette. New scroll-stopping hook, not a translated caption. Do not transcribe packaging or the reference ad. Distinctive thumb-stop, exact product. No alternatives.'
      : 'Task: Analyze Image 1 and write one SHORT image-edit prompt in Mode/Scene/Copy/Lock format (90–160 words excluding quoted copy). Do not transcribe packaging. Distinctive thumb-stop, exact product, scroll-stopping hook. Must not look like a default ChatGPT/Gemini ad. No alternatives.',
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

  if (input.aspectRatio) {
    parts.push(`Target format: ${input.aspectRatio} — ${ASPECT_RATIO_GUIDANCE[input.aspectRatio]}`)
  }

  const language = input.language ?? 'en'
  parts.push(`All on-image marketing text must be in ${getAdLanguageLabel(language)}.`)

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
  return markers.every(marker => text.includes(marker))
}

export function sanitizeStaticAdModelPrompt(raw: string): string {
  const trimmed = raw
    .trim()
    .replace(/^```(?:text)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()

  if (!trimmed) {
    throw new Error('Static ad prompt planning returned an empty response.')
  }

  if (hasAllMarkers(trimmed, COMPACT_SECTION_MARKERS) || hasAllMarkers(trimmed, LEGACY_SECTION_MARKERS)) {
    return trimmed
  }

  throw new Error('Static ad prompt planning returned an invalid format (expected Mode/Scene/Copy/Lock).')
}

export function assembleStaticAdImagePrompt(plannedPrompt: string, hasReferenceImage: boolean): string {
  const lock = hasReferenceImage
    ? "Exact product from Image 1. Recreate Image 2 layout, type hierarchy, and lighting. Recolor to Image 1's pack palette — not Image 2's product, brand, logo, or brand colors."
    : 'Exact product from Image 1. Distinctive Meta static ad, not a generic AI product shot.'
  return `${lock}\n\n${plannedPrompt}`
}
