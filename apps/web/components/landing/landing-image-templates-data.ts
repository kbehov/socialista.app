import { IMG } from './media'
import { getStudioTemplates } from '@/services/studio-templates.service'
import { StudioTemplateKind, type StudioTemplateDto } from '@socialista/types'

const LANDING_FETCH_LIMIT = 24
const LANDING_DISPLAY_COUNT = 16

const FALLBACK_PREVIEW_URLS = [
  IMG.gallery1,
  IMG.gallery2,
  IMG.gallery3,
  IMG.gallery4,
  IMG.studioImages,
  IMG.adStill,
  IMG.adStillAlt,
  IMG.canvasFashion,
  IMG.canvasWatch,
  IMG.canvasLifestyle,
  IMG.canvasSkincare,
  IMG.heroStill2,
] as const

function fallbackTemplate(previewImageUrl: string, index: number): StudioTemplateDto {
  return {
    _id: `landing-fallback-${index}`,
    kind: StudioTemplateKind.IMAGE,
    previewImageUrl,
    categories: [],
    createdAt: new Date(0),
    payload: {},
  }
}

function buildFallbackTemplates(count: number): StudioTemplateDto[] {
  return Array.from({ length: count }, (_, index) =>
    fallbackTemplate(FALLBACK_PREVIEW_URLS[index % FALLBACK_PREVIEW_URLS.length]!, index),
  )
}

function padTemplates(items: StudioTemplateDto[], count: number): StudioTemplateDto[] {
  if (items.length === 0) return buildFallbackTemplates(count)
  if (items.length >= count) return items.slice(0, count)

  const padded = [...items]
  let index = 0
  while (padded.length < count) {
    padded.push(items[index % items.length]!)
    index += 1
  }
  return padded
}

export async function getLandingImageTemplates(): Promise<StudioTemplateDto[]> {
  try {
    const response = await getStudioTemplates({
      kind: StudioTemplateKind.IMAGE,
      limit: LANDING_FETCH_LIMIT,
      sort: '-createdAt',
    })

    if (response.success && response.data?.templates.length) {
      const seen = new Set<string>()
      const unique: StudioTemplateDto[] = []
      for (const template of response.data.templates) {
        const url = template.previewImageUrl?.trim()
        if (!url || seen.has(url)) continue
        seen.add(url)
        unique.push(template)
      }

      if (unique.length > 0) {
        return padTemplates(unique, LANDING_DISPLAY_COUNT)
      }
    }
  } catch {
    // Home should render when API is down
  }

  return buildFallbackTemplates(LANDING_DISPLAY_COUNT)
}
