import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const HARD_IMPORT_LIMIT = 500 * 1024 * 1024

const ALLOWED_PREFIXES = ['video/', 'audio/', 'image/'] as const

const PROXY_HEADERS = {
  'User-Agent': 'Socialista/1.0 (media-import-proxy)',
} as const

/**
 * Proxy remote media through the server so the video editor can stream URLs
 * without browser CORS restrictions. Range requests are forwarded so <video>
 * can seek without downloading the whole file.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return proxyMedia(request, false)
}

export async function HEAD(request: NextRequest): Promise<NextResponse> {
  return proxyMedia(request, true)
}

async function proxyMedia(request: NextRequest, headOnly: boolean): Promise<NextResponse> {
  const url = request.nextUrl.searchParams.get('url')

  if (!url || !/^https?:\/\//.test(url)) {
    return new NextResponse('Missing or invalid URL', { status: 400 })
  }

  const range = request.headers.get('range')
  const upstreamHeaders: Record<string, string> = { ...PROXY_HEADERS }
  if (range) upstreamHeaders.Range = range

  // Timeout only covers connecting + receiving headers; the body streams through.
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30_000)

  let response: Response
  try {
    response = await fetch(url, {
      method: headOnly ? 'HEAD' : 'GET',
      signal: controller.signal,
      headers: upstreamHeaders,
      redirect: 'follow',
      cache: 'no-store',
    })
  } catch {
    clearTimeout(timer)
    return new NextResponse('Failed to fetch media', { status: 502 })
  }
  clearTimeout(timer)

  if (!response.ok && response.status !== 206) {
    return new NextResponse('Upstream error', { status: response.status })
  }

  const contentType = response.headers.get('content-type')?.split(';')[0]?.trim() ?? ''
  if (contentType && !ALLOWED_PREFIXES.some(prefix => contentType.startsWith(prefix))) {
    return new NextResponse('Unsupported media type', { status: 400 })
  }

  const contentLength = response.headers.get('content-length')
  if (!range && contentLength && Number(contentLength) > HARD_IMPORT_LIMIT) {
    return new NextResponse('File exceeds 500MB import limit', { status: 413 })
  }

  if (!headOnly && !response.body) {
    return new NextResponse('Empty upstream response', { status: 502 })
  }

  const headers = new Headers()
  if (contentType) headers.set('Content-Type', contentType)
  headers.set('Cache-Control', 'public, max-age=3600')
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges')
  headers.set('Accept-Ranges', response.headers.get('accept-ranges') ?? 'bytes')

  const contentRange = response.headers.get('content-range')
  if (contentRange) headers.set('Content-Range', contentRange)
  if (contentLength) headers.set('Content-Length', contentLength)

  return new NextResponse(headOnly ? null : response.body, {
    status: response.status,
    headers,
  })
}
