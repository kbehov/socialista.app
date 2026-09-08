import { logger } from '@trigger.dev/sdk/v3'

import { uploadR2Object } from './r2-client.js'

export type UploadExportedVideoInput = {
  workspaceId: string
  videoId: string
  runId: string
  bytes: Buffer
}

/** Upload an exported MP4 to R2 and return the public CDN URL. */
export async function uploadExportedVideo({
  workspaceId,
  videoId,
  runId,
  bytes,
}: UploadExportedVideoInput): Promise<string> {
  const key = `videos/exports/${workspaceId}/${videoId}-${runId}.mp4`
  const url = await uploadR2Object({ key, bytes, contentType: 'video/mp4' })
  logger.info('Exported video uploaded to R2', { key, bytes: bytes.length })
  return url
}
