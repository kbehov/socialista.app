import type { Clip, ClipId, TextOverlay, Track } from '@socialista/types'

export type SplitAtPlayheadInput = {
  playhead: number
  selectedClipId: ClipId | null
  selectedOverlayId: string | null
  clips: Record<ClipId, Clip>
  tracks: Track[]
  textOverlays: TextOverlay[]
}

export function canSplitAtPlayhead({
  playhead,
  selectedClipId,
  selectedOverlayId,
  clips,
  tracks,
  textOverlays,
}: SplitAtPlayheadInput): boolean {
  if (selectedClipId) {
    const clip = clips[selectedClipId]
    if (!clip) return false
    const track = tracks.find(t => t.id === clip.trackId)
    if (track?.locked) return false
    const localTime = playhead - clip.startTime
    return localTime > 0 && localTime < clip.duration
  }

  if (selectedOverlayId) {
    const overlay = textOverlays.find(o => o.id === selectedOverlayId)
    if (!overlay) return false
    return playhead > overlay.startTime + 0.05 && playhead < overlay.endTime - 0.05
  }

  return false
}

export function splitDisabledReason(input: SplitAtPlayheadInput): string | null {
  if (!input.selectedClipId && !input.selectedOverlayId) {
    return 'Select a clip or text layer'
  }
  if (canSplitAtPlayhead(input)) return null
  return 'Move the playhead inside the clip'
}
