import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/**
 * Proxy remote images through the server so the export pipeline can draw them
 * onto a canvas without cross-origin restrictions.
 *
 * The export function replaces remote image URLs with /api/image-proxy?url=...
 * before serialising the slide to PNG. Responses are aggressively cached since
 * the same background image may be exported multiple times in a session.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = request.nextUrl.searchParams.get('url')

  if (!url || !/^https?:\/\//.test(url)) {
    return new NextResponse('Missing or invalid URL', { status: 400 })
  }

  let response: Response
  try {
    response = await fetch(url, {
      signal: AbortSignal.timeout(15_000),
      headers: { 'User-Agent': 'Socialista/1.0 (image-export-proxy)' },
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
