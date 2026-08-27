import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type { Notification } from '@socialista/types'

function metadataString(metadata: Record<string, unknown> | undefined, key: string) {
  const value = metadata?.[key]
  return typeof value === 'string' && value ? value : undefined
}

export function notificationHref(notification: Notification): string {
  const resource = notification.resource
  if (!resource) return DASHBOARD_ROUTES.NOTIFICATIONS

  switch (resource.kind) {
    case 'generation': {
      const runId = metadataString(notification.metadata, 'triggerRunId')
      const kind = metadataString(notification.metadata, 'generationKind')
      if (kind === 'video' && runId) return DASHBOARD_ROUTES.STUDIO.videoRun(runId)
      if (kind === 'static-ad' && runId) return DASHBOARD_ROUTES.STUDIO.staticAdRun(runId)
      if (kind === 'slideshow' && runId) return DASHBOARD_ROUTES.STUDIO.slideshowRun(runId)
      if (runId) return DASHBOARD_ROUTES.STUDIO.imageRun(runId)
      return DASHBOARD_ROUTES.GENERATIONS
    }
    case 'video':
      return DASHBOARD_ROUTES.STUDIO.video(resource.id)
    case 'post':
      return DASHBOARD_ROUTES.POSTS
    case 'billing':
      return DASHBOARD_ROUTES.UPGRADE
    default:
      return DASHBOARD_ROUTES.NOTIFICATIONS
  }
}
