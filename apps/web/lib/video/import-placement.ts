import { useVideoEditorStore } from '@/lib/video/store'
import { addAssetToTimeline } from '@/lib/video/timeline-placement'
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
  const result = addAssetToTimeline(assetId, playhead)
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
