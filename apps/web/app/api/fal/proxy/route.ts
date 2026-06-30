import { auth } from '@/auth'
import { type NextRequest, NextResponse } from 'next/server'
const FAL_TARGET_URL_HEADER = 'x-fal-target-url'

async function proxyRequest(req: NextRequest) {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const targetUrl = req.headers.get(FAL_TARGET_URL_HEADER)
  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing target URL header.' }, { status: 400 })
  }

  const falKey = process.env.FAL_KEY
  if (!falKey) {
    return NextResponse.json({ error: 'FAL_KEY is not configured.' }, { status: 500 })
  }

  const headers = new Headers(req.headers)
  headers.set('Authorization', `Key ${falKey}`)
  headers.delete(FAL_TARGET_URL_HEADER)
  headers.delete('host')

  const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.arrayBuffer() : undefined

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete('content-encoding')

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  })
}

export const GET = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
