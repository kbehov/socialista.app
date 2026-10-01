import sharp from 'sharp'
import { logger } from '@trigger.dev/sdk/v3'

import { uploadR2Object } from '../r2-client.js'
import { fetchBinary, PublishHttpError } from './fetch.js'
import { PermanentPublishError, type PublishContext } from './types.js'

/** TikTok photo posts accept JPEG/WebP only, at most 1080p: short edge ≤1080, long edge ≤1920. */
const TIKTOK_SHORT_EDGE = 1080
const TIKTOK_LONG_EDGE = 1920
const TIKTOK_MAX_BYTES = 20 * 1024 * 1024
const ACCEPTED_FORMATS = new Set(['jpeg', 'webp'])

function orientedSize(
  width: number,
  height: number,
  orientation?: number,
): { width: number; height: number } {
  if (orientation && orientation >= 5 && orientation <= 8) {
    return { width: height, height: width }
  }
  return { width, height }
}

function withinTikTokPhoto(width: number, height: number): boolean {
  const short = Math.min(width, height)
  const long = Math.max(width, height)
  return short >= 1 && short <= TIKTOK_SHORT_EDGE && long <= TIKTOK_LONG_EDGE
}

function fitTikTokPhoto(width: number, height: number): { width: number; height: number } {
  const short = Math.min(width, height)
  const long = Math.max(width, height)
  const scale = Math.min(1, TIKTOK_SHORT_EDGE / short, TIKTOK_LONG_EDGE / long)
  let nextWidth = Math.max(1, Math.floor(width * scale))
  let nextHeight = Math.max(1, Math.floor(height * scale))
  const nextShort = Math.min(nextWidth, nextHeight)
  const nextLong = Math.max(nextWidth, nextHeight)
  if (nextShort > TIKTOK_SHORT_EDGE || nextLong > TIKTOK_LONG_EDGE) {
    const adjust = Math.min(TIKTOK_SHORT_EDGE / nextShort, TIKTOK_LONG_EDGE / nextLong)
    nextWidth = Math.max(1, Math.floor(nextWidth * adjust))
    nextHeight = Math.max(1, Math.floor(nextHeight * adjust))
  }
  return { width: nextWidth, height: nextHeight }
}

async function encodeJpeg(buffer: Buffer, width: number, height: number): Promise<Buffer> {
  const target = fitTikTokPhoto(width, height)
  const render = (quality: number) =>
    sharp(buffer, { failOn: 'none' })
      .rotate()
      .resize(target.width, target.height, { fit: 'inside', withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer()

  let quality = 85
  let bytes = await render(quality)

  while (bytes.length > TIKTOK_MAX_BYTES && quality > 40) {
    quality -= 10
    bytes = await render(quality)
  }

  if (bytes.length > TIKTOK_MAX_BYTES) {
    throw new PermanentPublishError('TikTok photos must be under 20MB')
  }
  return bytes
}

async function prepareTikTokImage(ctx: PublishContext, url: string, index: number): Promise<string> {
  let downloaded: { buffer: ArrayBuffer; contentType: string }
  try {
    downloaded = await fetchBinary(url)
  } catch (error) {
    if (error instanceof PublishHttpError) {
      throw new PermanentPublishError('TikTok could not use this image. Check that the media URL is public.')
    }
    throw error
  }

  const buffer = Buffer.from(downloaded.buffer)
  const meta = await sharp(buffer, { failOn: 'none' })
    .metadata()
    .catch(() => {
      throw new PermanentPublishError('TikTok could not read this image')
    })

  if (!meta.width || !meta.height) {
    throw new PermanentPublishError('TikTok could not read this image size')
  }

  const { width, height } = orientedSize(meta.width, meta.height, meta.orientation)
  const format = meta.format ?? ''
  const needsOrient = meta.orientation != null && meta.orientation !== 1
  const accepted =
    ACCEPTED_FORMATS.has(format) &&
    withinTikTokPhoto(width, height) &&
    buffer.length <= TIKTOK_MAX_BYTES &&
    !needsOrient
  if (accepted) return url

  const jpeg = await encodeJpeg(buffer, width, height)
  const workspaceId = ctx.post.workspace.toString()
  const postId = ctx.post._id.toString()
  const key = `posts/tiktok/${workspaceId}/${postId}/${index}.jpg`
  const uploaded = await uploadR2Object({ key, bytes: jpeg, contentType: 'image/jpeg' })
  logger.info('Prepared TikTok photo', {
    index,
    format,
    width,
    height,
    bytes: jpeg.length,
  })
  return uploaded
}

export async function prepareTikTokImages(ctx: PublishContext, imageUrls: string[]): Promise<string[]> {
  return Promise.all(imageUrls.map((url, index) => prepareTikTokImage(ctx, url, index)))
}
