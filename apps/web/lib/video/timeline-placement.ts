import { useVideoEditorStore } from './store'
import { isMediaAssetAvailable } from './types'
import type { MediaAsset } from './types'
import type { Project, TrackId } from '@socialista/types'

export const ASSET_DRAG_MIME = 'application/x-socialista-asset-id'

export function getTrackEndTime(project: Project, trackId: TrackId): number {
  const track = project.tracks.find(t => t.id === trackId)
  if (!track) return 0

  let end = 0
  for (const id of track.clips) {
    const clip = project.clips[id]
    if (clip) end = Math.max(end, clip.startTime + clip.duration)
  }
  return end
}

export function findTrackForAsset(asset: MediaAsset, createAudioTrack = true): TrackId | null {
  const trackType = asset.type === 'audio' ? 'audio' : 'video'
  const state = useVideoEditorStore.getState()
  let track = state.project.tracks.find(t => t.type === trackType)
  if (!track && trackType === 'audio' && createAudioTrack) {
    state.addTrack('audio')
    track = useVideoEditorStore.getState().project.tracks.find(t => t.type === trackType)
  }
  return track?.id ?? null
}

export function addAssetToTimeline(
  assetId: string,
  startTime: number,
  trackId?: TrackId,
  duration?: number,
): 'ok' | 'missing' | 'no-track' | 'blocked' {
  const state = useVideoEditorStore.getState()
  const asset = state.assets[assetId]
  if (!asset || !isMediaAssetAvailable(asset)) return 'missing'

  const resolvedTrackId = trackId ?? findTrackForAsset(asset)
  if (!resolvedTrackId) return 'no-track'

  const track = state.project.tracks.find(t => t.id === resolvedTrackId)
  if (!track) return 'no-track'
  if (track.locked) return 'blocked'
  if (track.type !== (asset.type === 'audio' ? 'audio' : 'video')) return 'blocked'

  const clipId = state.addClip(assetId, resolvedTrackId, Math.max(0, startTime), duration)
  if (!clipId) return 'blocked'

  state.selectClip(clipId)
  state.seek(Math.max(0, startTime))
  return 'ok'
}
