import axios from 'axios'

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
const TIKTOK_REFERER = 'https://www.tiktok.com/'

type MediaKind = 'image' | 'video'

function isTikTokCdnUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host.includes('tiktok') || host.includes('byteoversea') || host.includes('muscdn')
  } catch {
    return false
  }
}

function buildRequestHeaders(url: string, kind: MediaKind): Record<string, string> {
  const common = {
    'User-Agent': BROWSER_USER_AGENT,
    'Accept-Language': 'en-US,en;q=0.9',
  }

  if (isTikTokCdnUrl(url)) {
    return {
      ...common,
      Referer: TIKTOK_REFERER,
      Accept: kind === 'video' ? '*/*' : 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      'Sec-Fetch-Dest': kind,
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'cross-site',
    }
  }

  return {
    ...common,
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
  }
}

async function downloadFromUrl(url: string, maxSizeBytes: number, kind: MediaKind): Promise<Buffer> {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    timeout: 30_000,
    maxContentLength: maxSizeBytes,
    maxRedirects: 5,
    headers: buildRequestHeaders(url, kind),
    validateStatus: status => status === 200,
  })
  return Buffer.from(response.data)
}

export async function downloadImage(url: string): Promise<Buffer> {
  return downloadFromUrl(url, MAX_IMAGE_SIZE_BYTES, 'image')
}

export async function downloadVideo(urls: string | string[]): Promise<Buffer> {
  const candidates = [...new Set((Array.isArray(urls) ? urls : [urls]).filter(Boolean))]
  if (candidates.length === 0) {
    throw new Error('No video URL provided')
  }

  let lastError: unknown
  for (const url of candidates) {
    try {
      return await downloadFromUrl(url, MAX_VIDEO_SIZE_BYTES, 'video')
    } catch (error) {
      lastError = error
    }
  }

  throw lastError
}
