import { buildPlatformCopyNotes, POST_COPYWRITING_SYSTEM } from '@/agents/prompts/copywriting'
import { auth } from '@/auth'
import type { SocialProvider } from '@socialista/types'
import { streamText, type ImagePart, type ModelMessage } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

const MAX_BRIEF_LENGTH = 2000
const MAX_CONTEXT_LENGTH = 10_000
const MAX_TONE_LENGTH = 120
const MAX_MEDIA_ITEMS = 4
const MIN_CAPTION_MAX = 100
const MAX_CAPTION_MAX = 63_206

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

type CopywriterMediaItem = {
  kind?: 'image' | 'video'
  url?: string
  thumbnailUrl?: string
  altText?: string
}

type PostCompletionBody = {
  prompt?: string
  platforms?: SocialProvider[]
  existingCaption?: string
  /** Last generated caption — used to steer regenerations toward a different angle. */
  previousCaption?: string
  captionMax?: number
  tone?: string
  media?: CopywriterMediaItem[]
}

type SanitizedMedia = {
  imageUrl: URL
  altText?: string
}

function parseHttpsUrl(value?: string): URL | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' ? url : null
  } catch {
    return null
  }
}

function sanitizeMedia(media?: CopywriterMediaItem[]): SanitizedMedia[] {
  if (!Array.isArray(media)) return []
  const items: SanitizedMedia[] = []

  for (const item of media) {
    if (items.length >= MAX_MEDIA_ITEMS) break
    // Videos can't be fed to the model — use their poster frame instead.
    const candidate = item.kind === 'video' ? item.thumbnailUrl : item.url
    const imageUrl = parseHttpsUrl(candidate)
    if (!imageUrl) continue
    const altText = item.altText?.trim().slice(0, 300)
    items.push(altText ? { imageUrl, altText } : { imageUrl })
  }

  return items
}

function sanitizePlatforms(platforms?: SocialProvider[]): SocialProvider[] {
  if (!Array.isArray(platforms)) return []
  return platforms.filter(provider => SOCIAL_PROVIDERS.has(provider))
}

function clampCaptionMax(value?: number): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.min(Math.max(Math.round(value), MIN_CAPTION_MAX), MAX_CAPTION_MAX)
}

type UserPromptInput = {
  prompt: string
  platforms: SocialProvider[]
  existingCaption?: string
  previousCaption?: string
  captionMax?: number
  tone?: string
  media: SanitizedMedia[]
}

function buildUserPrompt({
  prompt,
  platforms,
  existingCaption,
  previousCaption,
  captionMax,
  tone,
  media,
}: UserPromptInput): string {
  const sections: string[] = []

  if (platforms.length > 0) {
    sections.push(`Target platforms: ${platforms.join(', ')}`)
    const notes = buildPlatformCopyNotes(platforms)
    if (notes) sections.push(notes)
  }

  if (captionMax) {
    sections.push(
      `Hard character limit: ${captionMax} characters, spaces and line breaks included. Never exceed it — aim well under.`,
    )
  }

  if (tone?.trim()) {
    sections.push(`Desired tone: ${tone.trim()}`)
  }

  if (media.length > 0) {
    const altLines = media
      .map((item, index) => (item.altText ? `visual ${index + 1}: "${item.altText}"` : null))
      .filter(Boolean)
    sections.push(
      [
        `${media.length} visual${media.length === 1 ? '' : 's'} attached to this post (see image${media.length === 1 ? '' : 's'}). Write the caption as the other half of the visual — never describe what's visible.`,
        altLines.length > 0 ? `User-provided alt text — ${altLines.join('; ')}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    )
  }

  if (existingCaption?.trim()) {
    sections.push(
      `Existing caption in the composer (improve, rewrite, or build on this if relevant):\n${existingCaption.trim()}`,
    )
  }

  if (previousCaption?.trim()) {
    sections.push(
      `A previous generation the user rejected or wants a variation of — take a clearly different angle and hook, do not reuse its phrasing or structure:\n${previousCaption.trim()}`,
    )
  }

  sections.push(`User brief:\n${prompt}`)

  return sections.join('\n\n')
}

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  let body: PostCompletionBody
  try {
    body = (await request.json()) as PostCompletionBody
  } catch {
    return NextResponse.json({ success: false, message: 'Invalid request body' }, { status: 400 })
  }

  const prompt = body.prompt?.trim().slice(0, MAX_BRIEF_LENGTH)
  if (!prompt) {
    return NextResponse.json({ success: false, message: 'Prompt is required' }, { status: 400 })
  }

  const platforms = sanitizePlatforms(body.platforms)
  const captionMax = clampCaptionMax(body.captionMax)
  const media = sanitizeMedia(body.media)
  const tone = body.tone?.slice(0, MAX_TONE_LENGTH)
  const existingCaption = body.existingCaption?.slice(0, MAX_CONTEXT_LENGTH)
  const previousCaption = body.previousCaption?.slice(0, MAX_CONTEXT_LENGTH)

  const userPrompt = buildUserPrompt({
    prompt,
    platforms,
    existingCaption,
    previousCaption,
    captionMax,
    tone,
    media,
  })

  try {
    const result = streamText({
      model: 'openai/gpt-5.6-luna',
      system: POST_COPYWRITING_SYSTEM,
      temperature: 0.9,
      messages: buildMessages(userPrompt, media),
      onError: ({ error }) => {
        console.error('[ai/completions/post] stream error', error)
      },
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[ai/completions/post] failed to start generation', error)
    return NextResponse.json(
      { success: false, message: 'Failed to generate caption' },
      { status: 500 },
    )
  }
}

function buildMessages(userPrompt: string, media: SanitizedMedia[]): ModelMessage[] {
  if (media.length === 0) {
    return [{ role: 'user', content: userPrompt }]
  }

  const imageParts: ImagePart[] = media.map(item => ({ type: 'image', image: item.imageUrl }))
  return [
    {
      role: 'user',
      content: [{ type: 'text', text: userPrompt }, ...imageParts],
    },
  ]
}
