import { VIDEO_SCRIPT_SEGMENT_ROLES, type VideoScriptSegment } from '@socialista/types'
import { z } from 'zod'

export const videoScriptSegmentRoleSchema = z.enum(VIDEO_SCRIPT_SEGMENT_ROLES)

const videoScriptSegmentSchema = z.object({
  text: z
    .string()
    .describe(
      'On-screen caption only — plain text, no markdown, emojis, or hashtags. Keep short enough to read in one glance.',
    ),
  startTime: z
    .number()
    .describe('When this caption appears on the timeline, in seconds from 0.'),
  endTime: z
    .number()
    .describe('When this caption disappears, in seconds. Must be greater than startTime.'),
  role: videoScriptSegmentRoleSchema.describe(
    'hook = opening scroll-stopper, body = main beat, cta = closing call to action',
  ),
})

export const videoScriptGeneratedSchema = z.object({
  title: z
    .string()
    .describe('Short internal title for the script (3–8 words). Not shown on screen.'),
  segments: z
    .array(videoScriptSegmentSchema)
    .min(3)
    .max(20)
    .describe(
      'Timed on-screen captions covering the video. Sorted by startTime. Include exactly one hook first and one cta last; body segments in between.',
    ),
})

export type VideoScriptGenerated = z.infer<typeof videoScriptGeneratedSchema>

const MIN_SEGMENT_DURATION = 0.8

/**
 * Clamp, sort, enforce min duration, and resolve overlaps so the timeline
 * never receives invalid timing from the model.
 */
export function normalizeVideoScriptSegments(
  result: VideoScriptGenerated,
  duration: number,
): VideoScriptSegment[] {
  const maxEnd = Math.max(MIN_SEGMENT_DURATION, duration)

  const sorted = result.segments
    .map(segment => {
      const start = Math.max(0, Math.min(segment.startTime, maxEnd - MIN_SEGMENT_DURATION))
      const end = Math.max(start + MIN_SEGMENT_DURATION, Math.min(segment.endTime, maxEnd))
      return {
        text: segment.text.trim(),
        startTime: roundTime(start),
        endTime: roundTime(end),
        role: segment.role,
      }
    })
    .filter(segment => segment.text.length > 0)
    .sort((a, b) => a.startTime - b.startTime || a.endTime - b.endTime)

  if (sorted.length === 0) return []

  const normalized: VideoScriptSegment[] = []
  for (const segment of sorted) {
    const prev = normalized[normalized.length - 1]
    if (prev && segment.startTime < prev.endTime) {
      prev.endTime = roundTime(Math.max(prev.startTime + MIN_SEGMENT_DURATION, segment.startTime))
      if (prev.endTime > segment.startTime) {
        // Still overlapping after trim — push this segment after previous
        const nextStart = prev.endTime
        const span = Math.max(MIN_SEGMENT_DURATION, segment.endTime - segment.startTime)
        segment.startTime = roundTime(Math.min(nextStart, maxEnd - MIN_SEGMENT_DURATION))
        segment.endTime = roundTime(Math.min(segment.startTime + span, maxEnd))
      }
    }
    if (segment.endTime <= segment.startTime) continue
    if (segment.startTime >= maxEnd) continue
    normalized.push(segment)
  }

  return normalized
}

function roundTime(value: number): number {
  return Math.round(value * 100) / 100
}
