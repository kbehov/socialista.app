import { uploadToWorkspace } from '@/services/collection.service'
import { toSerializedAsset } from '@/lib/video/defaults'
import type { MediaAsset } from '@/lib/video/types'
import { isMediaAssetAvailable } from '@/lib/video/types'
import type { SerializedMediaAsset } from '@socialista/types'

type AssetMap = Record<string, MediaAsset | SerializedMediaAsset>

export type PersistVideoAssetsResult = {
  assets: SerializedMediaAsset[]
  uploadedBytes: number
}

function needsUpload(serialized: SerializedMediaAsset, runtime: MediaAsset | SerializedMediaAsset | undefined): runtime is MediaAsset {
  if (!runtime || !isMediaAssetAvailable(runtime)) return false
  if (!serialized.url) return true
  return serialized.hash !== runtime.hash
}

async function uploadAssetFile(
  workspaceId: string,
  file: File,
): Promise<{ url: string; fileId: string; size: number }> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await uploadToWorkspace(workspaceId, formData)
  if (!response.success || !response.data) {
    throw new Error(response.message ?? 'Failed to upload media')
  }
  return {
    url: response.data.url,
    fileId: response.data._id,
    size: response.data.size ?? file.size,
  }
}

/** Upload local media to workspace files before saving a video draft. */
export async function persistVideoAssets(
  workspaceId: string,
  serializedAssets: SerializedMediaAsset[],
  runtimeAssets: AssetMap,
): Promise<PersistVideoAssetsResult> {
  let uploadedBytes = 0
  const assets: SerializedMediaAsset[] = []

  for (const serialized of serializedAssets) {
    const runtime = runtimeAssets[serialized.id]

    if (!needsUpload(serialized, runtime)) {
      assets.push(serialized)
      continue
    }

    const uploaded = await uploadAssetFile(workspaceId, runtime.file)
    uploadedBytes += uploaded.size

    const persisted: SerializedMediaAsset = {
      ...toSerializedAsset(runtime),
      url: uploaded.url,
      fileId: uploaded.fileId,
    }
    assets.push(persisted)
  }

  return { assets, uploadedBytes }
}
