import { STATIC_AD_MARQUEE_IMAGES } from './media'
import { getStaticAdTemplates } from '@/services/static-ad-templates.service'

/** Enough tiles for three staggered marquee rows without obvious repetition */
const LANDING_MARQUEE_FETCH_LIMIT = 36
const LANDING_MARQUEE_MIN_IMAGES = 9

function dedupeUrls(urls: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const url of urls) {
    const trimmed = url.trim()
    if (!trimmed || seen.has(trimmed)) continue
    seen.add(trimmed)
    out.push(trimmed)
  }
  return out
}

function padMarqueeImages(urls: string[], minCount: number): string[] {
  if (urls.length === 0) return []
  if (urls.length >= minCount) return urls

  const padded = [...urls]
  let index = 0
  while (padded.length < minCount) {
    padded.push(urls[index % urls.length]!)
    index += 1
  }
  return padded
}

export async function getLandingStaticAdMarqueeImages(): Promise<string[]> {
  try {
    const response = await getStaticAdTemplates({
      limit: LANDING_MARQUEE_FETCH_LIMIT,
      sort: '-createdAt',
    })

    if (response.success && response.data?.templates.length) {
      const fromDb = dedupeUrls(response.data.templates.map(template => template.imageUrl))
      const padded = padMarqueeImages(fromDb, LANDING_MARQUEE_MIN_IMAGES)
      if (padded.length > 0) return padded
    }
  } catch {
    // Public home should still render if API is unreachable
  }

  return [...STATIC_AD_MARQUEE_IMAGES]
}
