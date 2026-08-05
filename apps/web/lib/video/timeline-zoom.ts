import { DEFAULT_ZOOM, ZOOM_LEVELS } from '@/lib/video/defaults'

/** Pick the nearest zoom level that fits the project duration in the viewport. */
export function fitZoomToProjectDuration(duration: number): number {
  if (typeof window === 'undefined') return DEFAULT_ZOOM
  const usable = Math.max(400, window.innerWidth - 360)
  const target = duration > 0 ? usable / Math.max(duration, 1) : DEFAULT_ZOOM
  return ZOOM_LEVELS.reduce((best, level) =>
    Math.abs(level - target) < Math.abs(best - target) ? level : best,
  )
}
