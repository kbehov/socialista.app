/** Magnetic snap threshold in pixels (converted to seconds via pxPerSec). */
export const SNAP_THRESHOLD_PX = 8

export type SnapResult = {
  time: number
  snapped: boolean
  guideTime: number | null
}

/**
 * Snap `time` to the nearest candidate within the pixel threshold.
 * Candidates typically include playhead, clip edges, and project bounds.
 */
export function snapTime(
  time: number,
  candidates: number[],
  pxPerSec: number,
  enabled: boolean,
): SnapResult {
  if (!enabled || pxPerSec <= 0 || candidates.length === 0) {
    return { time, snapped: false, guideTime: null }
  }

  const thresholdSec = SNAP_THRESHOLD_PX / pxPerSec
  let best: number | null = null
  let bestDist = Infinity

  for (const candidate of candidates) {
    const dist = Math.abs(candidate - time)
    if (dist <= thresholdSec && dist < bestDist) {
      best = candidate
      bestDist = dist
    }
  }

  if (best === null) {
    return { time, snapped: false, guideTime: null }
  }

  return { time: best, snapped: true, guideTime: best }
}

/** Collect snap targets for clip move/trim: playhead, other clip edges, 0, duration. */
export function collectClipSnapTargets(options: {
  playhead: number
  duration: number
  clips: Array<{ id: string; startTime: number; duration: number }>
  excludeClipId?: string
}): number[] {
  const targets = new Set<number>([0, Math.max(0, options.duration), options.playhead])

  for (const clip of options.clips) {
    if (options.excludeClipId && clip.id === options.excludeClipId) continue
    targets.add(clip.startTime)
    targets.add(clip.startTime + clip.duration)
  }

  return [...targets].filter(t => Number.isFinite(t) && t >= 0)
}

/** Collect snap targets for overlay move/trim. */
export function collectOverlaySnapTargets(options: {
  playhead: number
  duration: number
  overlays: Array<{ id: string; startTime: number; endTime: number }>
  clips: Array<{ startTime: number; duration: number }>
  excludeOverlayId?: string
}): number[] {
  const targets = new Set<number>([0, Math.max(0, options.duration), options.playhead])

  for (const overlay of options.overlays) {
    if (options.excludeOverlayId && overlay.id === options.excludeOverlayId) continue
    targets.add(overlay.startTime)
    targets.add(overlay.endTime)
  }

  for (const clip of options.clips) {
    targets.add(clip.startTime)
    targets.add(clip.startTime + clip.duration)
  }

  return [...targets].filter(t => Number.isFinite(t) && t >= 0)
}
