import { logger } from '@trigger.dev/sdk/v3'

import { uploadR2Object } from './r2-client.js'

export type UploadGeneratedAudioInput = {
  workspaceId: string
  projectId: string
  clipId: string
  runId: string
  bytes: Buffer
}

export async function uploadGeneratedAudio({
  workspaceId,
  projectId,
  clipId,
  runId,
  bytes,
}: UploadGeneratedAudioInput): Promise<string> {
  const key = `ugc/${workspaceId}/${projectId}/${clipId}-${runId}.mp3`
  const url = await uploadR2Object({ key, bytes, contentType: 'audio/mpeg' })
  logger.info('UGC voiceover uploaded to R2', { key, bytes: bytes.length })
  return url
}
