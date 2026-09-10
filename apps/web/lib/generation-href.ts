import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { Generation, GenerationKind } from '@socialista/types'

export function getGenerationHref(generation: Pick<Generation, 'kind' | 'triggerRunId'>): string {
  const runId = generation.triggerRunId
  if (!runId) return DASHBOARD_ROUTES.GENERATIONS

  switch (generation.kind) {
    case 'video':
      return DASHBOARD_ROUTES.STUDIO.videoRun(runId)
    case 'static-ad':
      return DASHBOARD_ROUTES.STUDIO.staticAdRun(runId)
    case 'slideshow':
      return DASHBOARD_ROUTES.STUDIO.slideshowRun(runId)
    case 'image':
    default:
      return DASHBOARD_ROUTES.STUDIO.imageRun(runId)
  }
}

export function getGenerationKindLabel(kind: GenerationKind): string {
  switch (kind) {
    case 'image':
      return 'Image'
    case 'static-ad':
      return 'Static ad'
    case 'video':
      return 'Video'
    case 'slideshow':
      return 'Slideshow'
    default:
      return 'Generation'
  }
}
