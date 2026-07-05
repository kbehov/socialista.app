import { frameAtTime, timeAtFrame } from '@/lib/video/timecode'

export function timeFromTimelinePointer(
  clientX: number,
  targetRect: DOMRect,
  scrollLeft: number,
  pxPerSec: number,
  fps: number,
  maxDuration: number,
): number {
  const x = clientX - targetRect.left + scrollLeft
  const raw = Math.max(0, x / pxPerSec)
  const snapped = timeAtFrame(frameAtTime(raw, fps), fps)
  return Math.min(snapped, maxDuration)
}
