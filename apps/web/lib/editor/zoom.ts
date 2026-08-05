export const DEFAULT_VIEWPORT_ZOOM = 1
export const DEFAULT_VIDEO_PREVIEW_ZOOM = 1
export const MIN_VIEWPORT_ZOOM = 0.25
export const MAX_VIEWPORT_ZOOM = 2
export const VIEWPORT_ZOOM_STEP = 0.1

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function clampViewportZoom(zoom: number): number {
  return clamp(zoom, MIN_VIEWPORT_ZOOM, MAX_VIEWPORT_ZOOM)
}
