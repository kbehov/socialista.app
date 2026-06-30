import { extractAllSlideTexts, extractHookSlideText } from '@/lib/google-vision'
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

  const extractAll =
    typeof body === 'object' && body !== null && 'extractAll' in body && body.extractAll === true

  if (!imageUrls?.length) {
    return NextResponse.json({ error: 'imageUrls must include at least one URL' }, { status: 400 })
  }

  try {
    if (extractAll || imageUrls.length > 1) {
      const slides = await extractAllSlideTexts(imageUrls)
      return NextResponse.json({ slides, hook: slides[0] ?? null })
    }

    const hook = await extractHookSlideText(imageUrls[0])
    return NextResponse.json({ hook })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to extract slide text'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
