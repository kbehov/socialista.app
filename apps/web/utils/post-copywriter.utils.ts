import { buildPlatformCopyNotes } from '@/agents/prompts/copywriting'
import type { SocialProvider } from '@socialista/types'
import type { FilePart, ModelMessage } from 'ai'

export const POST_COPYWRITER_LIMITS = {
  brief: 2000,
  context: 10_000,
  tone: 120,
  mediaItems: 4,
  captionMaxMin: 100,
  captionMaxMax: 63_206,
} as const

const SOCIAL_PROVIDERS = new Set<SocialProvider>([
  'instagram',
  'facebook',
  'twitter',
  'linkedin',
  'tiktok',
  'youtube',
  'pinterest',
  'threads',
])

export type CopywriterMediaItem = {
  kind?: 'image' | 'video'
  url?: string
  thumbnailUrl?: string
  altText?: string
}

export type PostCompletionBody = {
  prompt?: string
  platforms?: SocialProvider[]
  existingCaption?: string
  previousCaption?: string
  captionMax?: number
  tone?: string
  media?: CopywriterMediaItem[]
}

export type SanitizedMedia = {
  imageUrl: URL
  altText?: string
}

export type SanitizedPostCompletionInput = {
  prompt: string
  platforms: SocialProvider[]
  existingCaption?: string
  previousCaption?: string
  captionMax?: number
  tone?: string
  media: SanitizedMedia[]
}

export function parseHttpsUrl(value?: string): URL | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

export function sanitizeCopywriterMedia(media?: CopywriterMediaItem[]): SanitizedMedia[] {
  if (!Array.isArray(media)) return []
  const items: SanitizedMedia[] = []

  for (const item of media) {
    if (items.length >= POST_COPYWRITER_LIMITS.mediaItems) break
    // Images only — skip videos (and any item without an image URL).
    if (item.kind === 'video') continue
    const imageUrl = parseHttpsUrl(item.url)
    if (!imageUrl) continue
    const altText = item.altText?.trim().slice(0, 300)
    items.push(altText ? { imageUrl, altText } : { imageUrl })
  }

  return items
}

export function sanitizeCopywriterPlatforms(platforms?: SocialProvider[]): SocialProvider[] {
  if (!Array.isArray(platforms)) return []
  // Dedupe defensively — a repeated platform would otherwise duplicate
  // per-platform notes in the prompt.
  return [...new Set(platforms.filter(provider => SOCIAL_PROVIDERS.has(provider)))]
}

export function clampCaptionMax(value?: number): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.min(
    Math.max(Math.round(value), POST_COPYWRITER_LIMITS.captionMaxMin),
    POST_COPYWRITER_LIMITS.captionMaxMax,
  )
}

export function sanitizePostCompletionBody(body: PostCompletionBody): SanitizedPostCompletionInput | { error: string } {
  const prompt = body.prompt?.trim().slice(0, POST_COPYWRITER_LIMITS.brief)
  if (!prompt) return { error: 'Prompt is required' }

  return {
    prompt,
    platforms: sanitizeCopywriterPlatforms(body.platforms),
    captionMax: clampCaptionMax(body.captionMax),
    media: sanitizeCopywriterMedia(body.media),
    tone: body.tone?.trim().slice(0, POST_COPYWRITER_LIMITS.tone) || undefined,
    existingCaption: body.existingCaption?.trim().slice(0, POST_COPYWRITER_LIMITS.context) || undefined,
    previousCaption: body.previousCaption?.trim().slice(0, POST_COPYWRITER_LIMITS.context) || undefined,
  }
}

export function buildPostCopywriterUserPrompt({
  prompt,
  platforms,
  existingCaption,
  previousCaption,
  captionMax,
  tone,
  media,
}: SanitizedPostCompletionInput): string {
  const sections: string[] = [
    'Creative brief — write one scroll-stopping caption a top creator would post as-is. Be specific, human, and opinionated. No marketing sludge.',
  ]

  if (platforms.length > 0) {
    sections.push(`Target platforms: ${platforms.join(', ')}`)
    const notes = buildPlatformCopyNotes(platforms)
    if (notes) sections.push(notes)
  }

  if (captionMax) {
    sections.push(
      `Hard character limit: ${captionMax} characters (spaces + line breaks count). Never exceed it. Default target: ~35–55% of the limit unless the brief asks for story/long-form.`,
    )
  }

  if (tone) {
    sections.push(`Tone direction: ${tone}. Commit to it fully — do not drift into generic brand-safe voice.`)
  } else {
    sections.push(
      'Tone: auto — pick the sharpest voice that fits the brief and platforms. Prefer human and specific over polished and safe.',
    )
  }

  if (media.length > 0) {
    const altLines: string[] = []
    for (let i = 0; i < media.length; i++) {
      const altText = media[i]?.altText
      if (altText) altLines.push(`visual ${i + 1}: "${altText}"`)
    }
    sections.push(
      [
        `${media.length} visual${media.length === 1 ? '' : 's'} attached (see image${media.length === 1 ? '' : 's'}). Study first. Caption = the other half of the thought — never describe what's visible.`,
        altLines.length > 0 ? `User-provided alt text — ${altLines.join('; ')}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }

  if (existingCaption) {
    sections.push(
      `Existing caption in the composer — improve, sharpen, or rebuild from this if useful (keep facts/names that matter):\n${existingCaption}`,
    )
  }

  if (previousCaption) {
    sections.push(
      `Rejected previous generation — new angle, new hook, new structure. Do not reuse phrasing:\n${previousCaption}`,
    )
  }

  sections.push(`Brief:\n${prompt}`)
  sections.push('Return only the final caption.')

  return sections.join('\n\n')
}

export function buildPostCopywriterMessages(userPrompt: string, media: SanitizedMedia[]): ModelMessage[] {
  if (media.length === 0) {
    return [{ role: 'user', content: userPrompt }]
  }

  // Images first so the model grounds in the visual before writing the caption.
  const imageParts: FilePart[] = media.map(item => ({ type: 'file', data: item.imageUrl, mediaType: 'image' }))
  return [{ role: 'user', content: [...imageParts, { type: 'text', text: userPrompt }] }]
}
