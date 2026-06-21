const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
} as const

export type TikTokPostType = 'video' | 'slideshow'

export interface TikTokPostAuthor {
  id: string
  username: string
  nickname: string
  avatarUrl?: string
  verified: boolean
}

export interface TikTokPostStats {
  likes: number
  views: number
  comments: number
  shares: number
  bookmarks: number
  reposts: number
}

export interface TikTokExtractResult {
  id: string
  url: string
  description: string
  type: TikTokPostType
  author: TikTokPostAuthor
  imageUrls: string[]
  videoUrls: string[]
  stats: TikTokPostStats
  createdAt?: number
}

export class TikTokExtractError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message)
    this.name = 'TikTokExtractError'
  }
}

interface TikTokImagePost {
  images?: Array<{
    imageURL?: {
      urlList?: string[]
    }
  }>
}

interface TikTokVideo {
  playAddr?: string
  downloadAddr?: string
  cover?: string
  originCover?: string
  dynamicCover?: string
  bitrateInfo?: Array<{
    PlayAddr?: {
      UrlList?: string[]
    }
  }>
}

interface TikTokItemStruct {
  id: string
  desc?: string
  createTime?: string | number
  imagePost?: TikTokImagePost
  video?: TikTokVideo
  author?: {
    id?: string
    uniqueId?: string
    nickname?: string
    avatarLarger?: string
    verified?: boolean
  }
  stats?: Record<string, string | number>
  statsV2?: Record<string, string | number>
}

export function isTikTokUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')
    return host === 'tiktok.com' || host.endsWith('.tiktok.com')
  } catch {
    return false
  }
}

function normalizeTikTokFetchUrl(url: string): string {
  const parsed = new URL(url)

  // Photo pages omit embedded post data; the same item loads under /video/.
  parsed.pathname = parsed.pathname.replace(/\/photo\//, '/video/')
  parsed.search = ''
  parsed.hash = ''

  return parsed.toString()
}

function toNumber(value: string | number | undefined): number {
  if (value === undefined) return 0
  if (typeof value === 'number') return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function uniqueUrls(urls: Array<string | undefined>): string[] {
  return [...new Set(urls.filter((url): url is string => Boolean(url)))]
}

function extractImageUrls(imagePost: TikTokImagePost): string[] {
  return uniqueUrls(
    (imagePost.images ?? []).map((image) => image.imageURL?.urlList?.[0]).filter((url): url is string => Boolean(url)),
  )
}

function extractVideoUrls(video: TikTokVideo): string[] {
  const bitrateUrls = (video.bitrateInfo ?? []).flatMap(info => info.PlayAddr?.UrlList ?? [])
  return uniqueUrls([video.downloadAddr, ...bitrateUrls, video.playAddr])
}

function extractCoverUrls(video: TikTokVideo | undefined): string[] {
  if (!video) return []
  return uniqueUrls([video.cover, video.originCover, video.dynamicCover])
}

function parseItemStruct(item: TikTokItemStruct, url: string): TikTokExtractResult {
  const slideshowImages = item.imagePost ? extractImageUrls(item.imagePost) : []
  const type: TikTokPostType = slideshowImages.length > 0 ? 'slideshow' : 'video'
  const statsSource = item.statsV2 ?? item.stats ?? {}

  return {
    id: item.id,
    url,
    description: item.desc ?? '',
    type,
    author: {
      id: item.author?.id ?? '',
      username: item.author?.uniqueId ?? '',
      nickname: item.author?.nickname ?? '',
      avatarUrl: item.author?.avatarLarger,
      verified: item.author?.verified ?? false,
    },
    imageUrls: type === 'slideshow' ? slideshowImages : extractCoverUrls(item.video),
    videoUrls: type === 'video' ? extractVideoUrls(item.video ?? {}) : [],
    stats: {
      likes: toNumber(statsSource.diggCount),
      views: toNumber(statsSource.playCount),
      comments: toNumber(statsSource.commentCount),
      shares: toNumber(statsSource.shareCount),
      bookmarks: toNumber(statsSource.collectCount),
      reposts: toNumber(statsSource.repostCount),
    },
    createdAt: item.createTime ? toNumber(item.createTime) : undefined,
  }
}

function isWafBlocked(html: string): boolean {
  return html.includes('slardar_us_waf') || html.includes('SlardarWAF')
}

function parseRehydrationHtml(html: string): TikTokItemStruct {
  if (isWafBlocked(html)) {
    throw new TikTokExtractError('TikTok blocked the request', 502)
  }

  const match = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/)
  if (!match?.[1]) {
    throw new TikTokExtractError('TikTok page data not found', 502)
  }

  let data: {
    __DEFAULT_SCOPE__?: {
      'webapp.video-detail'?: {
        statusCode?: number
        statusMsg?: string
        itemInfo?: {
          itemStruct?: TikTokItemStruct
        }
      }
    }
  }

  try {
    data = JSON.parse(match[1]) as typeof data
  } catch {
    throw new TikTokExtractError('Failed to parse TikTok page data', 502)
  }

  const videoDetail = data.__DEFAULT_SCOPE__?.['webapp.video-detail']
  if (!videoDetail) {
    throw new TikTokExtractError('TikTok video detail not found', 502)
  }

  if (videoDetail.statusCode && videoDetail.statusCode !== 0) {
    throw new TikTokExtractError(videoDetail.statusMsg ?? 'TikTok post not found', 404)
  }

  const item = videoDetail.itemInfo?.itemStruct
  if (!item?.id) {
    throw new TikTokExtractError('TikTok post data is missing', 502)
  }

  return item
}

export async function extractTikTokPost(inputUrl: string): Promise<TikTokExtractResult> {
  const trimmedUrl = inputUrl.trim()
  if (!trimmedUrl) {
    throw new TikTokExtractError('URL is required', 400)
  }

  if (!isTikTokUrl(trimmedUrl)) {
    throw new TikTokExtractError('Invalid TikTok URL', 400)
  }

  const fetchUrl = normalizeTikTokFetchUrl(trimmedUrl)

  let response: Response
  try {
    response = await fetch(fetchUrl, {
      headers: BROWSER_HEADERS,
      redirect: 'follow',
      cache: 'no-store',
    })
  } catch {
    throw new TikTokExtractError('Failed to fetch TikTok page', 502)
  }

  if (!response.ok) {
    throw new TikTokExtractError(`TikTok returned ${response.status}`, 502)
  }

  const html = await response.text()
  const item = parseRehydrationHtml(html)

  return parseItemStruct(item, trimmedUrl)
}
