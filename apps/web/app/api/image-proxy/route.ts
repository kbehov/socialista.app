import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const TIKTOK_REFERER = 'https://www.tiktok.com/'
const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/**
 * Proxy remote images through the server so the export pipeline can draw them
 * onto a canvas without cross-origin restrictions.
 *
 * The export function replaces remote image URLs with /api/image-proxy?url=...
 * before serialising the slide to PNG. Responses are aggressively cached since
 * the same background image may be exported multiple times in a session.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const rawUrl = request.nextUrl.searchParams.get('url')
  const url = unwrapTargetUrl(rawUrl)

  if (!url || !/^https?:\/\//.test(url)) {
    return new NextResponse('Missing or invalid URL', { status: 400 })
  }

  let response: Response
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      headers: buildUpstreamHeaders(url),
      redirect: 'follow',
    })
  } catch {
    return new NextResponse('Failed to fetch image', { status: 502 })
  }

  if (!response.ok) {
    return new NextResponse('Upstream error', { status: response.status })
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.startsWith('image/')) {
    return new NextResponse('Not an image', { status: 400 })
  }

  const body = await response.arrayBuffer()
  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=86400, immutable',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

/** Unwrap accidentally nested `/api/image-proxy?url=…` targets. */
function unwrapTargetUrl(url: string | null): string | null {
  if (!url) return null

  let current = url
  for (let i = 0; i < 5; i++) {
    try {
      const parsed = new URL(current)
      if (!parsed.pathname.includes('/api/image-proxy')) break
      const nested = parsed.searchParams.get('url')
      if (!nested || nested === current) break
      current = nested
    } catch {
      break
    }
  }
  return current
}

function isTikTokCdnUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase()
    return host.includes('tiktok') || host.includes('byteoversea') || host.includes('muscdn')
  } catch {
    return false
  }
}

function buildUpstreamHeaders(url: string): HeadersInit {
  if (isTikTokCdnUrl(url)) {
    return {
      'User-Agent': BROWSER_USER_AGENT,
      Referer: TIKTOK_REFERER,
      Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
    }
  }

  return {
    'User-Agent': BROWSER_USER_AGENT,
    Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
  }
}
