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

/** Scroll the timeline so a time position is comfortably in view. */
export function scrollTimelineToTime(
  scrollContainer: HTMLElement,
  time: number,
  headerWidth: number,
  pxPerSec: number,
): void {
  const timePx = headerWidth + time * pxPerSec
  const viewportWidth = scrollContainer.clientWidth
  const maxScroll = Math.max(0, scrollContainer.scrollWidth - viewportWidth)
  const padding = 48
  const current = scrollContainer.scrollLeft

  let target = current
  if (timePx < current + padding) {
    target = timePx - padding
  } else if (timePx > current + viewportWidth - padding) {
    target = timePx - viewportWidth + padding
  }

  target = Math.max(0, Math.min(maxScroll, target))
  if (Math.abs(target - current) < 1) return

  scrollContainer.scrollTo({ left: target, behavior: 'smooth' })
}
