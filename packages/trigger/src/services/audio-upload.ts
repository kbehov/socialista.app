import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { logger } from '@trigger.dev/sdk/v3'

function getR2Client(): S3Client {
  const accountId = process.env.R2_ACCOUNT_ID
  if (!accountId) {
    throw new Error('R2_ACCOUNT_ID is not set')
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
  })
}

function publicBaseUrl(): string {
  const base = (process.env.R2_CDN_BASE_URL ?? process.env.R2_PUBLIC_BASE_URL)?.replace(/\/$/, '')
  if (!base) {
    throw new Error('R2_CDN_BASE_URL or R2_PUBLIC_BASE_URL must be set')
  }
  return base
}

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
  const bucket = process.env.R2_BUCKET_NAME
  if (!bucket) {
    throw new Error('R2_BUCKET_NAME is not set')
  }

  const key = `ugc/${workspaceId}/${projectId}/${clipId}-${runId}.mp3`
  const client = getR2Client()

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: 'audio/mpeg',
    }),
  )

  const url = `${publicBaseUrl()}/${key}`
  logger.info('UGC voiceover uploaded to R2', { key, bytes: bytes.length })
  return url
}
