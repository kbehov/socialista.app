import { extractHookSlideText } from '@/lib/google-vision'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const imageUrls =
    typeof body === 'object' && body !== null && 'imageUrls' in body && Array.isArray(body.imageUrls)
      ? body.imageUrls.filter((url): url is string => typeof url === 'string' && url.length > 0)
      : undefined

  const imageUrl = imageUrls?.[0]
  if (!imageUrl) {
    return NextResponse.json({ error: 'imageUrls must include at least one URL' }, { status: 400 })
  }

  try {
    const hook = await extractHookSlideText(imageUrl)
    return NextResponse.json({ hook })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to extract hook slide text'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
