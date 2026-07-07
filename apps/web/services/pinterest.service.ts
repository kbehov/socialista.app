'use server'

const PINTEREST_API_BASE = 'https://api.pinterest.com/v5'

const IMAGE_SIZE_PRIORITY = ['1200x', '600x', '400x300', '150x150'] as const

type PinterestImageDetails = {
  url?: string
  width?: number
  height?: number
}

type PinterestPinMedia = {
  media_type?: string
  images?: Partial<Record<(typeof IMAGE_SIZE_PRIORITY)[number], PinterestImageDetails>>
}

type PinterestApiPin = {
  id?: string
  title?: string | null
  alt_text?: string | null
  description?: string | null
  link?: string | null
  media?: PinterestPinMedia
}

type PinterestApiSearchResponse = {
  items?: PinterestApiPin[]
  bookmark?: string | null
}

export type PinterestPinResult = {
  id: string
  imageUrl: string
  title?: string | null
  altText?: string | null
  width?: number
  height?: number
}

export type PinterestSearchPinsResponse = {
  items: PinterestPinResult[]
  bookmark: string | null
}

function getPinterestToken(): string {
  const token = process.env.PINTEREST_API_TOKEN?.trim()
  if (!token) {
    throw new Error('Pinterest API is not configured')
  }
  return token
}

function pickBestImage(media?: PinterestPinMedia): PinterestImageDetails | null {
  if (!media || media.media_type !== 'image' || !media.images) return null

  for (const size of IMAGE_SIZE_PRIORITY) {
    const image = media.images[size]
    if (image?.url) return image
  }

  const fallback = Object.values(media.images).find(image => image?.url)
  return fallback ?? null
}

function normalizePin(pin: PinterestApiPin): PinterestPinResult | null {
  const image = pickBestImage(pin.media)
  if (!image?.url) return null

  const id = pin.id ?? pin.link ?? image.url

  return {
    id,
    imageUrl: image.url,
    title: pin.title ?? pin.description ?? null,
    altText: pin.alt_text ?? null,
    width: image.width,
    height: image.height,
  }
}

async function pinterestGet<T>(path: string, params: Record<string, string | undefined>): Promise<T> {
  const url = new URL(`${PINTEREST_API_BASE}${path}`)
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value)
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${getPinterestToken()}`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(20_000),
    cache: 'no-store',
  })

  if (!response.ok) {
    let message = `Pinterest API error (${response.status})`
    try {
      const body = (await response.json()) as { message?: string }
      if (body.message) message = body.message
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export async function searchPinterestPins(input: {
  term: string
  bookmark?: string
  limit?: number
}): Promise<PinterestSearchPinsResponse> {
  const term = input.term.trim()
  if (!term) {
    throw new Error('Search query is required')
  }

  const limit = Math.min(Math.max(input.limit ?? 25, 1), 50)

  const data = await pinterestGet<PinterestApiSearchResponse>('/search/partner/pins', {
    term,
    bookmark: input.bookmark,
    limit: String(limit),
  })

  const items = (data.items ?? [])
    .map(normalizePin)
    .filter((pin): pin is PinterestPinResult => pin != null)

  return {
    items,
    bookmark: data.bookmark ?? null,
  }
}
