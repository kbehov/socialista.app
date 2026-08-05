import type { Clip } from '@socialista/types'
import { getClipSourceDuration } from '@/lib/video/defaults'

const MIN_DURATION_SEC = 0.1
const MIN_WIDTH_PX = 8

/** Preview clip block width while dragging trim handles (no store mutation). */
export function previewTrimWidthPx(
  clip: Clip,
  asset: { duration: number } | undefined,
  trimIn: number,
  trimOut: number,
  pxPerSec: number,
): number {
  const sourceDuration = getClipSourceDuration(clip, asset)
  const durationSec = Math.max(MIN_DURATION_SEC, sourceDuration - trimIn - trimOut)
  return Math.max(MIN_WIDTH_PX, durationSec * pxPerSec)
}
