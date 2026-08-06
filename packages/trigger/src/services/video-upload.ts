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
  const bucket = process.env.R2_BUCKET_NAME
  if (!bucket) {
    throw new Error('R2_BUCKET_NAME is not set')
  }

  const key = `videos/exports/${workspaceId}/${videoId}-${runId}.mp4`
  const client = getR2Client()

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: bytes,
      ContentType: 'video/mp4',
    }),
  )

  const url = `${publicBaseUrl()}/${key}`
  logger.info('Exported video uploaded to R2', { key, bytes: bytes.length })
  return url
}
