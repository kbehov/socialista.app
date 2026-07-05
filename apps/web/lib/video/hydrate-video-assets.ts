import { importMediaFromUrl } from '@/lib/video/media-import'
import type { MediaAsset } from '@/lib/video/types'
import type { SerializedMediaAsset } from '@socialista/types'

/** Restore runtime media from persisted CDN URLs after loading a saved video. */
export async function hydrateVideoAssets(serializedAssets: SerializedMediaAsset[]): Promise<MediaAsset[]> {
  const hydrated: MediaAsset[] = []

  for (const serialized of serializedAssets) {
    if (!serialized.url) continue

    try {
      const imported = await importMediaFromUrl(serialized.url, serialized.name)
      hydrated.push({
        ...imported,
        id: serialized.id,
        hash: serialized.hash,
        duration: serialized.duration,
        width: serialized.width ?? imported.width,
        height: serialized.height ?? imported.height,
        url: serialized.url,
        fileId: serialized.fileId,
      })
    } catch {
      // Asset stays unavailable; user can re-link manually.
    }
  }

  return hydrated
}
