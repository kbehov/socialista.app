import { PostType } from '@socialista/db'
import { z } from 'zod'

import { fetchBinary, fetchJson, sleep } from './fetch.js'
import {
  assertSupportedType,
  getCaption,
  getCarouselItems,
  getMediaUrl,
  getTextBody,
  PermanentPublishError,
  type PublishContext,
  type PublishResult,
} from './types.js'

const CHUNK_SIZE = 5 * 1024 * 1024
const ALT_TEXT_MAX = 1000
const MEDIA_PROCESS_ATTEMPTS = 90

const processingInfoSchema = z
  .object({
    state: z.string().optional(),
    check_after_secs: z.number().optional(),
    error: z
      .object({
        message: z.string().optional(),
        name: z.string().optional(),
      })
      .optional(),
  })
  .passthrough()

const mediaResponseSchema = z.object({
  data: z
    .object({
      id: z.union([z.string(), z.number()]).optional(),
      media_id: z.union([z.string(), z.number()]).optional(),
      processing_info: processingInfoSchema.optional(),
    })
    .passthrough(),
})

const tweetSchema = z.object({
  data: z.object({
    id: z.string().min(1),
  }),
})

type MediaKind = 'image' | 'video'
type MediaCategory = 'tweet_image' | 'tweet_gif' | 'tweet_video'

function xHeaders(accessToken: string, extra?: Record<string, string>): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    ...extra,
  }
}

function asMediaId(value: string | number | undefined): string | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value === 'string' && value.trim()) return value.trim()
  return undefined
}

function mediaIdFromResponse(payload: z.infer<typeof mediaResponseSchema>): string {
  const id = asMediaId(payload.data.id) ?? asMediaId(payload.data.media_id)
  if (!id) throw new PermanentPublishError('X media upload did not return a media id')
  return id
}

function tweetText(ctx: PublishContext): string {
  return getCaption(ctx.post) || getTextBody(ctx.post)
}

function tweetPermalink(ctx: PublishContext, tweetId: string): string {
  const username = ctx.account.username?.replace(/^@/, '').trim()
  if (username) return `https://x.com/${username}/status/${tweetId}`
  return `https://x.com/i/status/${tweetId}`
}

function getPostImageAltText(ctx: PublishContext): string | undefined {
  const content = ctx.post.content as { media?: { altText?: string } }
  const alt = typeof content.media?.altText === 'string' ? content.media.altText.trim() : ''
  return alt || undefined
}

function normalizeMediaType(contentType: string, kind: MediaKind, url: string): string {
  const raw = contentType.split(';')[0]?.trim().toLowerCase() || ''
  if (raw.startsWith('image/') || raw.startsWith('video/')) return raw

  const path = url.split('?')[0]?.toLowerCase() ?? ''
  if (path.endsWith('.gif')) return 'image/gif'
  if (path.endsWith('.png')) return 'image/png'
  if (path.endsWith('.webp')) return 'image/webp'
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg'
  if (path.endsWith('.mp4') || path.endsWith('.mov') || path.endsWith('.m4v')) return 'video/mp4'
  return kind === 'video' ? 'video/mp4' : 'image/jpeg'
}

function mediaCategory(mediaType: string, kind: MediaKind): MediaCategory {
  if (kind === 'video') return 'tweet_video'
  if (mediaType === 'image/gif') return 'tweet_gif'
  return 'tweet_image'
}

function mediaFilename(mediaType: string): string {
  if (mediaType === 'image/gif') return 'media.gif'
  if (mediaType === 'image/png') return 'media.png'
  if (mediaType === 'image/webp') return 'media.webp'
  if (mediaType.startsWith('video/')) return 'media.mp4'
  return 'media.jpg'
}

async function waitForMediaProcessing(
  accessToken: string,
  mediaId: string,
  initial?: z.infer<typeof processingInfoSchema>,
): Promise<void> {
  let info = initial

  for (let attempt = 0; attempt < MEDIA_PROCESS_ATTEMPTS; attempt++) {
    if (!info) {
      const status = await fetchJson('https://api.x.com/2/media/upload', mediaResponseSchema, {
        headers: xHeaders(accessToken),
        searchParams: { command: 'STATUS', media_id: mediaId },
      })
      info = status.data.processing_info
      if (!info) return
    }

    const state = (info.state ?? '').toLowerCase()
    if (state === 'succeeded' || !state) return
    if (state === 'failed') {
      throw new PermanentPublishError(info.error?.message || 'X media processing failed')
    }

    const waitSeconds = Math.min(Math.max(info.check_after_secs ?? 2, 1), 10)
    await sleep(waitSeconds * 1000)
    info = undefined
  }

  throw new PermanentPublishError('X media processing timed out')
}

async function setMediaAltText(accessToken: string, mediaId: string, altText: string): Promise<void> {
  const text = altText.slice(0, ALT_TEXT_MAX).trim()
  if (!text) return

  await fetchJson('https://api.x.com/2/media/metadata', z.object({}).passthrough(), {
    method: 'POST',
    headers: xHeaders(accessToken, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      id: mediaId,
      metadata: {
        alt_text: { text },
      },
    }),
    allowEmpty: true,
  })
}

async function uploadMedia(
  ctx: PublishContext,
  source: { url: string; kind: MediaKind; altText?: string },
): Promise<{ mediaId: string; category: MediaCategory }> {
  const { buffer, contentType } = await fetchBinary(source.url)
  if (buffer.byteLength === 0) {
    throw new PermanentPublishError('X media file is empty')
  }

  const mediaType = normalizeMediaType(contentType, source.kind, source.url)
  const category = mediaCategory(mediaType, source.kind)
  const initialized = await fetchJson('https://api.x.com/2/media/upload/initialize', mediaResponseSchema, {
    method: 'POST',
    headers: xHeaders(ctx.accessToken, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      media_type: mediaType,
      total_bytes: buffer.byteLength,
      media_category: category,
    }),
  })

  const mediaId = mediaIdFromResponse(initialized)
  const bytes = new Uint8Array(buffer)
  const filename = mediaFilename(mediaType)

  for (let offset = 0, segmentIndex = 0; offset < bytes.byteLength; offset += CHUNK_SIZE, segmentIndex++) {
    const chunk = bytes.subarray(offset, Math.min(offset + CHUNK_SIZE, bytes.byteLength))
    const form = new FormData()
    form.append('segment_index', String(segmentIndex))
    form.append('media', new Blob([new Uint8Array(chunk)], { type: mediaType }), filename)

    await fetchJson(`https://api.x.com/2/media/upload/${mediaId}/append`, z.object({}).passthrough(), {
      method: 'POST',
      headers: xHeaders(ctx.accessToken),
      body: form,
      allowEmpty: true,
    })
  }

  const finalized = await fetchJson(
    `https://api.x.com/2/media/upload/${mediaId}/finalize`,
    mediaResponseSchema,
    {
      method: 'POST',
      headers: xHeaders(ctx.accessToken),
    },
  )

  if (finalized.data.processing_info || category === 'tweet_video' || category === 'tweet_gif') {
    await waitForMediaProcessing(ctx.accessToken, mediaId, finalized.data.processing_info)
  }

  if (source.altText && category === 'tweet_image') {
    await setMediaAltText(ctx.accessToken, mediaId, source.altText)
  }

  return { mediaId, category }
}

async function createTweet(ctx: PublishContext, mediaIds?: string[]): Promise<PublishResult> {
  const text = tweetText(ctx)
  const body: Record<string, unknown> = {}
  if (text) body.text = text
  if (mediaIds && mediaIds.length > 0) {
    body.media = { media_ids: mediaIds }
  }
  if (!body.text && !body.media) {
    throw new PermanentPublishError('X posts require text or media')
  }

  const created = await fetchJson('https://api.x.com/2/tweets', tweetSchema, {
    method: 'POST',
    headers: xHeaders(ctx.accessToken, { 'Content-Type': 'application/json' }),
    body: JSON.stringify(body),
  })

  return {
    providerPostId: created.data.id,
    providerPermalink: tweetPermalink(ctx, created.data.id),
  }
}

export async function publishTwitterPost(ctx: PublishContext): Promise<PublishResult> {
  assertSupportedType(ctx.account.provider, ctx.post.type, [
    PostType.TEXT,
    PostType.IMAGE,
    PostType.VIDEO,
    PostType.CAROUSEL,
  ])

  if (ctx.post.type === PostType.TEXT) {
    const text = tweetText(ctx)
    if (!text) throw new PermanentPublishError('X text posts require a body or caption')
    return createTweet(ctx)
  }

  if (ctx.post.type === PostType.IMAGE) {
    const uploaded = await uploadMedia(ctx, {
      url: getMediaUrl(ctx.post),
      kind: 'image',
      altText: getPostImageAltText(ctx),
    })
    await ctx.persistOperationId?.(uploaded.mediaId)
    return createTweet(ctx, [uploaded.mediaId])
  }

  if (ctx.post.type === PostType.VIDEO) {
    const uploaded = await uploadMedia(ctx, {
      url: getMediaUrl(ctx.post),
      kind: 'video',
    })
    await ctx.persistOperationId?.(uploaded.mediaId)
    return createTweet(ctx, [uploaded.mediaId])
  }

  const items = getCarouselItems(ctx.post)
  if (items.some(item => item.kind === 'video')) {
    throw new PermanentPublishError('X photo posts cannot include videos')
  }
  if (items.length < 2) {
    throw new PermanentPublishError('X photo posts require at least 2 images')
  }
  if (items.length > 4) {
    throw new PermanentPublishError('X posts allow at most 4 photos')
  }

  const mediaIds: string[] = []
  for (const item of items) {
    const uploaded = await uploadMedia(ctx, {
      url: item.url,
      kind: 'image',
      altText: item.altText,
    })
    if (uploaded.category !== 'tweet_image') {
      throw new PermanentPublishError('X photo posts cannot include GIFs')
    }
    mediaIds.push(uploaded.mediaId)
  }

  await ctx.persistOperationId?.(mediaIds.join(','))
  return createTweet(ctx, mediaIds)
}
