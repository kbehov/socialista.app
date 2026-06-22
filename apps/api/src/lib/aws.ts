import { DeleteObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import dotenv from 'dotenv'
import 'dotenv/config'
import { Buffer } from 'node:buffer'
dotenv.config()
// configure r2
const R2_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
const R2_BUCKET = process.env.R2_BUCKET_NAME
const R2_PUBLIC_BASE_URL = process.env.R2_PUBLIC_BASE_URL // Ensure no trailing '/'
const R2_CDN_BASE_URL = process.env.R2_CDN_BASE_URL
// configure client
const s3 = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
})

/** Upload bytes to R2 and return the public CDN URL (same pattern as upload routes). */
export async function uploadBufferToR2(key: string, body: Buffer, contentType: string): Promise<string> {
  if (!R2_BUCKET) {
    throw new Error('R2_BUCKET_NAME is not set')
  }
  const base = (R2_CDN_BASE_URL ?? R2_PUBLIC_BASE_URL)?.replace(/\/$/, '')
  if (!base) {
    throw new Error('R2_CDN_BASE_URL or R2_PUBLIC_BASE_URL must be set for public theme URLs')
  }
  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )
  return `${base}/${key}`
}

export async function getObjectSizeFromR2(key: string): Promise<number> {
  if (!R2_BUCKET) {
    throw new Error('R2_BUCKET_NAME is not set')
  }

  const response = await s3.send(
    new HeadObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }),
  )

  return response.ContentLength ?? 0
}

export async function deleteObjectFromR2(key: string): Promise<void> {
  if (!R2_BUCKET) {
    throw new Error('R2_BUCKET_NAME is not set')
  }

  await s3.send(
    new DeleteObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    }),
  )
}

export { R2_BUCKET, R2_CDN_BASE_URL, R2_PUBLIC_BASE_URL, s3 }
