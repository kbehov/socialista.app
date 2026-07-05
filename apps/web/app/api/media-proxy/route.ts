import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const HARD_IMPORT_LIMIT = 500 * 1024 * 1024

const ALLOWED_PREFIXES = ['video/', 'audio/', 'image/'] as const

/**
 * Proxy remote media through the server so the video editor can import URLs
 * without browser CORS restrictions.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl.searchParams.get('url')

  if (!url || !/^https?:\/\//.test(url)) {
    return new NextResponse('Missing or invalid URL', { status: 400 })
  }

  let response: Response
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(30_000),
      headers: { 'User-Agent': 'Socialista/1.0 (media-import-proxy)' },
      redirect: 'follow',
    })
  } catch {
    return new NextResponse('Failed to fetch media', { status: 502 })
  }

  if (!response.ok) {
    return new NextResponse('Upstream error', { status: response.status })
  }

  const contentType = response.headers.get('content-type')?.split(';')[0]?.trim() ?? ''
  if (!ALLOWED_PREFIXES.some(prefix => contentType.startsWith(prefix))) {
    return new NextResponse('Unsupported media type', { status: 400 })
  }

  const contentLength = response.headers.get('content-length')
  if (contentLength && Number(contentLength) > HARD_IMPORT_LIMIT) {
    return new NextResponse('File exceeds 500MB import limit', { status: 413 })
  }

  const body = await response.arrayBuffer()
  if (body.byteLength > HARD_IMPORT_LIMIT) {
    return new NextResponse('File exceeds 500MB import limit', { status: 413 })
  }

  return new NextResponse(body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
