'use server'

const PIXABAY_VIDEO_API = 'https://pixabay.com/api/videos/'
const QUERY_MAX_LENGTH = 100
const PIXABAY_CACHE_SECONDS = 86_400

type PixabayVideoFile = {
  url?: string
  width?: number
  height?: number
  size?: number
  thumbnail?: string
}

type PixabayVideoRenditions = {
  large?: PixabayVideoFile
  medium?: PixabayVideoFile
  small?: PixabayVideoFile
  tiny?: PixabayVideoFile
}

type PixabayApiVideo = {
  id: number
  pageURL?: string
  type?: string
  tags?: string
  duration?: number
  videos?: PixabayVideoRenditions
  user?: string
  user_id?: number
}

type PixabayApiSearchResponse = {
  total?: number
  totalHits?: number
  hits?: PixabayApiVideo[]
}

export type PixabayVideoResult = {
  id: number
  pageUrl?: string
  tags?: string
  duration: number
  previewUrl: string
  videoUrl: string
  width: number
  height: number
  size: number
  name: string
  userName?: string
}

export type PixabaySearchVideosResponse = {
  items: PixabayVideoResult[]
  page: number
  totalPages: number
}

const RENDITION_ORDER = ['medium', 'large', 'small', 'tiny'] as const

function getPixabayApiKey(): string {
  const key = process.env.PIXABAY_API_KEY?.trim()
  if (!key) {
    throw new Error('Pixabay API is not configured')
  }
  return key
}

function usableFile(file: PixabayVideoFile | undefined): file is PixabayVideoFile {
  return Boolean(file?.url?.trim())
}

function pickRendition(videos: PixabayVideoRenditions | undefined): PixabayVideoFile | null {
  if (!videos) return null
  for (const key of RENDITION_ORDER) {
    const file = videos[key]
    if (usableFile(file)) return file
  }
  return null
}

function pickPreviewUrl(videos: PixabayVideoRenditions | undefined, fallback?: string): string {
  if (!videos) return fallback ?? ''
  return (
    videos.tiny?.thumbnail ||
    videos.small?.thumbnail ||
    videos.medium?.thumbnail ||
    videos.large?.thumbnail ||
    fallback ||
    ''
  )
}

function videoFileName(hit: PixabayApiVideo): string {
  const firstTag = hit.tags?.split(',')[0]?.trim() ?? ''
  const slug = firstTag
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 40)
  return `pixabay-${slug || 'video'}-${hit.id}.mp4`
}

function normalizeVideo(hit: PixabayApiVideo): PixabayVideoResult | null {
  const rendition = pickRendition(hit.videos)
  if (!rendition?.url) return null

  const previewUrl = pickPreviewUrl(hit.videos, rendition.thumbnail)
  if (!previewUrl) return null

  return {
    id: hit.id,
    pageUrl: hit.pageURL,
    tags: hit.tags,
    duration: hit.duration ?? 0,
    previewUrl,
    videoUrl: rendition.url,
    width: rendition.width ?? 0,
    height: rendition.height ?? 0,
    size: rendition.size ?? 0,
    name: videoFileName(hit),
    userName: hit.user,
  }
}

async function pixabayFetch<T>(params: Record<string, string | undefined>): Promise<T> {
  const url = new URL(PIXABAY_VIDEO_API)
  url.searchParams.set('key', getPixabayApiKey())
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value)
  }

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(20_000),
    cache: 'force-cache',
    next: { revalidate: PIXABAY_CACHE_SECONDS },
  })

  if (!response.ok) {
    let message = `Pixabay API error (${response.status})`
    try {
      const text = (await response.text()).trim()
      if (text) message = text
    } catch {
      // ignore body parse errors
    }
    throw new Error(message)
  }

  return response.json() as Promise<T>
}

export async function searchPixabayVideos(input: {
  query?: string
  page?: number
  perPage?: number
  videoType?: 'all' | 'film' | 'animation'
}): Promise<PixabaySearchVideosResponse> {
  const query = input.query?.trim().slice(0, QUERY_MAX_LENGTH) ?? ''
  const page = Math.max(input.page ?? 1, 1)
  const perPage = Math.min(Math.max(input.perPage ?? 20, 3), 200)

  const data = await pixabayFetch<PixabayApiSearchResponse>({
    q: query || undefined,
    page: String(page),
    per_page: String(perPage),
    safesearch: 'true',
    ...(input.videoType && input.videoType !== 'all' ? { video_type: input.videoType } : {}),
  })

  const items = (data.hits ?? []).map(normalizeVideo).filter((video): video is PixabayVideoResult => video != null)
  const totalHits = data.totalHits ?? items.length

  return {
    items,
    page,
    totalPages: Math.max(1, Math.ceil(totalHits / perPage)),
  }
}
