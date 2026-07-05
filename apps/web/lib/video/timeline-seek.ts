import { frameAtTime, timeAtFrame } from '@/lib/video/timecode'

/** Map a screen X coordinate to timeline time using the scroll container. */
export function timeFromTimelineClientX(
  clientX: number,
  scrollContainer: HTMLElement,
  headerWidth: number,
  pxPerSec: number,
  fps: number,
  maxDuration: number,
): number {
  const rect = scrollContainer.getBoundingClientRect()
  const x = scrollContainer.scrollLeft + (clientX - rect.left) - headerWidth
  const raw = Math.max(0, x / pxPerSec)
  const snapped = timeAtFrame(frameAtTime(raw, fps), fps)
  return Math.min(snapped, maxDuration)
}
