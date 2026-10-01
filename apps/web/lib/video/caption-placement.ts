import type { Clip, TextOverlay, VideoCaptionSegment } from '@socialista/types'
import { CAPTION_OVERLAY_PRESET } from '@/lib/video/defaults'

const MIN_CAPTION_DURATION = 0.1
const RANGE_EPSILON = 0.02
const CAPTION_Y_STEP = 14
const MIN_CAPTION_Y = 18

export function clipPlaybackSpeed(clip: Clip): number {
  if (clip.type !== 'video') return 1
  const speed = clip.speed
  return typeof speed === 'number' && Number.isFinite(speed) && speed > 0 ? speed : 1
}

export function captionSourceTimeToTimeline(clip: Clip, sourceTime: number): number {
  return clip.startTime + sourceTime / clipPlaybackSpeed(clip)
}

export function clipTimelineRange(clip: Clip): { startTime: number; endTime: number } {
  return {
    startTime: clip.startTime,
    endTime: clip.startTime + clip.duration,
  }
}

/**
 * Whisper times are source seconds from the clip in-point.
 * Timeline position is clip start plus those seconds divided by playback speed.
 */
export function captionSegmentsToOverlays(
  clip: Clip,
  segments: VideoCaptionSegment[],
): { content: string; startTime: number; endTime: number }[] {
  const clipStart = clip.startTime
  const clipEnd = clip.startTime + clip.duration

  const placed = segments.flatMap(segment => {
    const text = segment.text.trim()
    if (!text) return []
    const startTime = captionSourceTimeToTimeline(clip, segment.startTime)
    const endTime = captionSourceTimeToTimeline(clip, segment.endTime)
    const clampedStart = Math.max(clipStart, startTime)
    if (clipEnd - clampedStart < MIN_CAPTION_DURATION) return []
    const safeEnd = Math.min(clipEnd, Math.max(clampedStart + MIN_CAPTION_DURATION, endTime))
    if (safeEnd - clampedStart < MIN_CAPTION_DURATION) return []
    return [{ content: text, startTime: clampedStart, endTime: safeEnd }]
  })

  for (let i = 0; i < placed.length - 1; i++) {
    const current = placed[i]!
    const next = placed[i + 1]!
    if (current.endTime > next.startTime) {
      current.endTime = Math.max(current.startTime + MIN_CAPTION_DURATION, next.startTime)
    }
  }

  return placed.filter(item => item.endTime - item.startTime >= MIN_CAPTION_DURATION - 0.001)
}

/** Captions tied to this clip, plus older untagged text that lives entirely inside it. */
export function overlayBelongsToClipReplace(
  overlay: TextOverlay,
  clipId: string,
  range: { startTime: number; endTime: number },
): boolean {
  if (overlay.clipId) return overlay.clipId === clipId
  return (
    overlay.startTime >= range.startTime - RANGE_EPSILON &&
    overlay.endTime <= range.endTime + RANGE_EPSILON
  )
}

/** Stack caption blocks upward when another clip's text already occupies this time range. */
export function captionAnchorY(
  overlays: TextOverlay[],
  clipId: string,
  range: { startTime: number; endTime: number },
): number {
  const occupied = new Set<number>()
  for (const overlay of overlays) {
    if (overlayBelongsToClipReplace(overlay, clipId, range)) continue
    if (overlay.endTime <= range.startTime + RANGE_EPSILON) continue
    if (overlay.startTime >= range.endTime - RANGE_EPSILON) continue
    occupied.add(Math.round(overlay.y))
  }

  let y = CAPTION_OVERLAY_PRESET.y
  while (occupied.has(Math.round(y)) && y > MIN_CAPTION_Y) {
    y -= CAPTION_Y_STEP
  }
  return y
}
