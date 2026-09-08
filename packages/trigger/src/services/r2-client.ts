import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'

let r2Client: S3Client | undefined

export function getR2Client(): S3Client {
  if (r2Client) return r2Client
  const accountId = process.env.R2_ACCOUNT_ID
  if (!accountId) {
    throw new Error('R2_ACCOUNT_ID is not set')
  }
  r2Client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
  })
  return r2Client
}

export function publicR2BaseUrl(): string {
  const base = (process.env.R2_CDN_BASE_URL ?? process.env.R2_PUBLIC_BASE_URL)?.replace(/\/$/, '')
  if (!base) {
    throw new Error('R2_CDN_BASE_URL or R2_PUBLIC_BASE_URL must be set')
  }
  return base
}

export async function uploadR2Object(input: {
  key: string
  bytes: Buffer
  contentType: string
}): Promise<string> {
  const bucket = process.env.R2_BUCKET_NAME
  if (!bucket) {
    throw new Error('R2_BUCKET_NAME is not set')
  }

  await getR2Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.key,
      Body: input.bytes,
      ContentType: input.contentType,
    }),
  )

  return `${publicR2BaseUrl()}/${input.key}`
}
