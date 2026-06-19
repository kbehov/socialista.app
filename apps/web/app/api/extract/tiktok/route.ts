import { extractTikTokPost, TikTokExtractError } from '@/lib/tiktok/extract'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const url = typeof body === 'object' && body !== null && 'url' in body ? body.url : undefined
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  try {
    const data = await extractTikTokPost(url)
    return NextResponse.json(data)
  } catch (error) {
    if (error instanceof TikTokExtractError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }

    return NextResponse.json({ error: 'Failed to extract TikTok post' }, { status: 500 })
  }
}
