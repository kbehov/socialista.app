import { useVideoEditorStore } from '@/lib/video/store'
import {
  addAssetToTimeline,
  findTrackForAsset,
  getTrackEndTime,
} from '@/lib/video/timeline-placement'
import { isMediaAssetAvailable } from '@/lib/video/types'
import type { MediaAsset } from '@/lib/video/types'
import { toast } from 'sonner'

export function placementErrorMessage(result: ReturnType<typeof addAssetToTimeline>, name: string): string {
  switch (result) {
    case 'missing':
      return `${name} is not available — re-link the file first.`
    case 'no-track':
      return `No compatible track available for this media.`
    case 'blocked':
      return `Could not place ${name} on the timeline — the track may be locked or full.`
    default:
      return `Added ${name} to the timeline`
  }
}

export function placeAssetAtPlayhead(assetId: string, name: string): boolean {
  const playhead = useVideoEditorStore.getState().playhead
  let result = addAssetToTimeline(assetId, playhead)

  if (result === 'blocked') {
    const state = useVideoEditorStore.getState()
    const asset = state.assets[assetId]
    const trackId = asset && isMediaAssetAvailable(asset) ? findTrackForAsset(asset, false) : null
    const track = trackId ? state.project.tracks.find(t => t.id === trackId) : undefined

    if (trackId && track && !track.locked) {
      const appendAt = getTrackEndTime(state.project, trackId)
      if (appendAt !== playhead) {
        result = addAssetToTimeline(assetId, appendAt, trackId)
        if (result === 'ok') {
          toast.success(`Added ${name} after existing clips`)
          return true
        }
      }
    }
  }

  if (result === 'ok') {
    toast.success(`Added ${name} at playhead`)
    return true
  }
  toast.error(placementErrorMessage(result, name))
  return false
}

export function registerAndPlaceAtPlayhead(asset: MediaAsset): void {
  const registerAsset = useVideoEditorStore.getState().registerAsset
  registerAsset(asset)
  placeAssetAtPlayhead(asset.id, asset.name)
}

/** Create an audio track if needed, then drop the clip at the playhead (or after existing audio). */
export function placeAudioOnTimeline(asset: MediaAsset): boolean {
  if (asset.type !== 'audio') {
    toast.error('Generated file is not audio')
    return false
  }

  useVideoEditorStore.getState().registerAsset(asset)

  const playhead = useVideoEditorStore.getState().playhead
  let result = addAssetToTimeline(asset.id, playhead)

  if (result !== 'ok') {
    const trackId = findTrackForAsset(asset, true)
    if (trackId) {
      const project = useVideoEditorStore.getState().project
      const appendAt = getTrackEndTime(project, trackId)
      result = addAssetToTimeline(asset.id, appendAt, trackId)
    }
  }

  if (result === 'ok') {
    toast.success('Audio added to the audio track')
    return true
  }

  toast.error(placementErrorMessage(result, asset.name))
  return false
}
