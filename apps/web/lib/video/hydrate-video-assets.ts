import { proxiedMediaUrl } from '@/lib/video/media-import'
import type { MediaAsset } from '@/lib/video/types'
import type { SerializedMediaAsset } from '@socialista/types'

/**
 * Restore runtime media from persisted CDN URLs after loading a saved video.
 *
 * Does not download bytes — the preview streams from the proxied URL using
 * range requests. Timeline thumbnails fill in afterwards in the background.
 */
export function hydrateVideoAssets(serializedAssets: SerializedMediaAsset[]): MediaAsset[] {
  const hydrated: MediaAsset[] = []

  for (const serialized of serializedAssets) {
    if (!serialized.url) continue
    hydrated.push({
      ...serialized,
      objectUrl: proxiedMediaUrl(serialized.url),
    })
  }

  return hydrated
}
