import type { MediaType, SerializedMediaAsset } from '@socialista/types'

/**
 * Client-side media asset. Extends the persisted {@link SerializedMediaAsset}
 * with fields that only exist in browser memory (File, objectUrl, thumbnails,
 * waveform). These are stripped before save.
 */
export interface MediaAsset extends SerializedMediaAsset {
  file: File
  objectUrl: string
  /** Base64 JPEG thumbnails for timeline strips (video/image). */
  thumbnails?: string[]
  /** Downsampled min/max peaks (compact binary) for audio waveform display. */
  waveform?: Int8Array
}

export function isMediaAssetAvailable(asset: MediaAsset | SerializedMediaAsset): asset is MediaAsset {
  return 'file' in asset && 'objectUrl' in asset
}

export function inferMediaType(file: File): MediaType | null {
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  if (file.type.startsWith('image/')) return 'image'
  return null
}
