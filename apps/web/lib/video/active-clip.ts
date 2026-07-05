import type { Clip, Project, VideoClip } from '@socialista/types'

/** Top-most visible video/image clip at a given timeline time. */
export function pickActiveVideoClip(
  tracks: Project['tracks'],
  clips: Project['clips'],
  assets: Record<string, unknown>,
  time: number,
): VideoClip | null {
  for (let i = tracks.length - 1; i >= 0; i--) {
    const track = tracks[i]
    if (!track || track.type !== 'video' || track.muted) continue
    for (const clipId of track.clips) {
      const clip = clips[clipId]
      if (!clip || clip.type === 'audio') continue
      if (time >= clip.startTime && time < clip.startTime + clip.duration) {
        if (!assets[clip.assetId]) continue
        return clip
      }
    }
  }
  return null
}

export function isClipActiveAtTime(clip: Clip, time: number): boolean {
  return time >= clip.startTime && time < clip.startTime + clip.duration
}
