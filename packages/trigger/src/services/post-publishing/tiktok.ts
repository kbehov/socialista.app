import { PostType, type IPost } from '@socialista/db'
import { z } from 'zod'

import { fetchJson, PublishHttpError, sleep } from './fetch.js'
import { prepareTikTokImages } from './tiktok-images.js'
import {
  assertSupportedType,
  getCaption,
  getCarouselItems,
  getMediaUrl,
  PermanentPublishError,
  type PublishContext,
  type PublishResult,
} from './types.js'

const PRIVACY_PREFERENCE = [
  'PUBLIC_TO_EVERYONE',
  'FOLLOWER_OF_CREATOR',
  'MUTUAL_FOLLOW_FRIENDS',
  'SELF_ONLY',
] as const

const UNAUDITED_CLIENT_CODE = 'unaudited_client_can_only_post_to_private_accounts'

const envelopeSchema = z.object({
  data: z.unknown().optional(),
  error: z
    .object({
      code: z.string().optional(),
      message: z.string().optional(),
    })
    .optional(),
})

const creatorInfoSchema = z.object({
  privacy_level_options: z.array(z.string()).optional(),
  comment_disabled: z.boolean().optional(),
  duet_disabled: z.boolean().optional(),
  stitch_disabled: z.boolean().optional(),
  max_video_post_duration_sec: z.number().optional(),
})

const initSchema = z.object({
  publish_id: z.string().min(1),
})

const statusSchema = z.object({
  status: z.string(),
  fail_reason: z.string().optional(),
  publicaly_available_post_id: z.array(z.union([z.string(), z.number()])).optional(),
  publicly_available_post_id: z.array(z.union([z.string(), z.number()])).optional(),
})

type CreatorInfo = {
  privacyLevelOptions: string[]
  commentDisabled: boolean
  duetDisabled: boolean
  stitchDisabled: boolean
  maxVideoPostDurationSec?: number
}

class TikTokApiError extends Error {
  readonly code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = 'TikTokApiError'
    this.code = code
  }
}

function readTikTokError(body: unknown, fallback: string): { code?: string; message: string } {
  if (!body || typeof body !== 'object') return { message: fallback }
  const error = (body as { error?: { code?: unknown; message?: unknown } }).error
  const code = typeof error?.code === 'string' ? error.code : undefined
  const message = typeof error?.message === 'string' && error.message.trim() ? error.message : fallback
  return { code, message }
}

function isUnauditedClientError(error: unknown): boolean {
  if (!(error instanceof TikTokApiError)) return false
  if (error.code === UNAUDITED_CLIENT_CODE) return true
  return error.message.includes('content-sharing-guidelines')
}

function humanizeTikTokError(error: TikTokApiError): string {
  switch (error.code) {
    case UNAUDITED_CLIENT_CODE:
      return 'TikTok only allows private posts until this app passes review. Set the TikTok account to Private in the TikTok app and publish again, or reconnect TikTok so the post can be sent to your inbox.'
    case 'url_ownership_unverified':
      return 'TikTok could not fetch the media URL. Verify this domain under URL properties in the TikTok developer app.'
    case 'scope_not_authorized':
      return 'TikTok is missing permission to publish. Reconnect the TikTok account and try again.'
    case 'privacy_level_option_mismatch':
      return 'TikTok rejected the privacy level for this account. Publish again so the latest account settings are used.'
    case 'spam_risk_too_many_posts':
    case 'reached_active_user_cap':
      return 'TikTok’s daily posting limit was reached. Try again later.'
    case 'spam_risk_too_many_pending_share':
      return 'TikTok inbox already has too many unfinished posts. Open TikTok and finish or discard them, then try again.'
    case 'spam_risk_user_banned_from_posting':
      return 'This TikTok account cannot post right now.'
    case 'access_token_invalid':
      return 'TikTok access expired. Reconnect the account and try again.'
    case 'app_version_check_failed':
      return 'Update the TikTok app on your phone, then publish again.'
    default:
      return error.message.includes('content-sharing-guidelines')
        ? 'TikTok only allows private posts until this app passes review. Set the TikTok account to Private in the TikTok app and publish again, or reconnect TikTok so the post can be sent to your inbox.'
        : error.message
  }
}

function rethrowTikTok(error: unknown): never {
  if (error instanceof TikTokApiError) {
    throw new PermanentPublishError(humanizeTikTokError(error))
  }
  throw error
}

const FAIL_REASONS: Record<string, string> = {
  video_pull_failed: 'TikTok could not download the video. Check that the media URL is public.',
  photo_pull_failed: 'TikTok could not download the photos. Check that the media URLs are public.',
  duration_check_failed: 'This video is longer than TikTok allows for this account.',
  file_format_check_failed: 'TikTok rejected the media format.',
  frame_rate_check_failed: 'TikTok rejected the video frame rate.',
  picture_size_check_failed:
    'TikTok rejected the photo. Photos must be JPEG or WebP and no larger than 1080×1920.',
  spam_risk_text: 'TikTok rejected the caption.',
  spam_risk_too_many_posts: 'TikTok’s daily posting limit was reached. Try again later.',
  auth_removed: 'TikTok authorization was removed. Reconnect the account.',
  publish_cancelled: 'TikTok cancelled the publish.',
  unaudited_client_can_only_post_to_private_accounts:
    'TikTok only allows private posts until this app passes review. Set the TikTok account to Private in the TikTok app and publish again.',
}

async function tikTokPost(url: string, accessToken: string, body: unknown): Promise<unknown> {
  let payload: z.infer<typeof envelopeSchema>
  try {
    payload = await fetchJson(url, envelopeSchema, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(body),
    })
  } catch (error) {
    if (error instanceof PublishHttpError) {
      if (error.retryable) throw error
      const details = readTikTokError(error.body, error.message)
      throw new TikTokApiError(details.message, details.code)
    }
    throw error
  }

  const code = payload.error?.code
  if (code && code !== 'ok') {
    const message = payload.error?.message?.trim() || code
    throw new TikTokApiError(message, code)
  }

  return payload.data
}

function parseData<T extends z.ZodTypeAny>(schema: T, data: unknown, label: string): z.infer<T> {
  const parsed = schema.safeParse(data)
  if (!parsed.success) {
    throw new PermanentPublishError(`Unexpected TikTok ${label} response`)
  }
  return parsed.data
}

async function queryCreatorInfo(accessToken: string): Promise<CreatorInfo> {
  const data = await tikTokPost(
    'https://open.tiktokapis.com/v2/post/publish/creator_info/query/',
    accessToken,
    {},
  )
  const info = parseData(creatorInfoSchema, data, 'creator info')
  const privacyLevelOptions = info.privacy_level_options ?? []
  if (privacyLevelOptions.length === 0) {
    throw new PermanentPublishError('TikTok did not return a privacy level for this account')
  }
  return {
    privacyLevelOptions,
    commentDisabled: info.comment_disabled ?? false,
    duetDisabled: info.duet_disabled ?? false,
    stitchDisabled: info.stitch_disabled ?? false,
    maxVideoPostDurationSec: info.max_video_post_duration_sec,
  }
}

function pickPrivacyLevel(options: string[]): string {
  for (const level of PRIVACY_PREFERENCE) {
    if (options.includes(level)) return level
  }
  return options[0] ?? 'SELF_ONLY'
}

function privacyLevelsToTry(options: string[]): string[] {
  const preferred = pickPrivacyLevel(options)
  const levels = [preferred]
  if (preferred !== 'SELF_ONLY' && options.includes('SELF_ONLY')) levels.push('SELF_ONLY')
  return levels
}

function videoDurationSeconds(post: IPost): number | undefined {
  const content = post.content as { media?: { durationSeconds?: number } }
  const seconds = content.media?.durationSeconds
  return typeof seconds === 'number' && seconds > 0 ? seconds : undefined
}

function assertVideoDuration(post: IPost, creator: CreatorInfo): void {
  const max = creator.maxVideoPostDurationSec
  const duration = videoDurationSeconds(post)
  if (!max || !duration || duration <= max) return
  throw new PermanentPublishError(
    `This video is ${Math.ceil(duration)}s. TikTok allows up to ${max}s for this account.`,
  )
}

function hasUploadScope(ctx: PublishContext): boolean {
  return ctx.account.scopes?.includes('video.upload') ?? false
}

async function waitForPublish(accessToken: string, publishId: string): Promise<PublishResult> {
  // TikTok caps each token at about 6 requests/minute. Stay under that after init.
  const maxAttempts = 40
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let data: unknown
    try {
      data = await tikTokPost('https://open.tiktokapis.com/v2/post/publish/status/fetch/', accessToken, {
        publish_id: publishId,
      })
    } catch (error) {
      if (error instanceof PublishHttpError && error.retryable) {
        await sleep(15_000)
        continue
      }
      throw error
    }

    const status = parseData(statusSchema, data, 'publish status')
    const code = status.status.toUpperCase()

    if (code === 'PUBLISH_COMPLETE' || code === 'SEND_TO_USER_INBOX') {
      const postId = status.publicaly_available_post_id?.[0] ?? status.publicly_available_post_id?.[0]
      return {
        providerPostId: postId !== undefined ? String(postId) : publishId,
        providerOperationId: publishId,
      }
    }

    if (code === 'FAILED') {
      const reason = status.fail_reason || 'TikTok publish failed'
      throw new PermanentPublishError(FAIL_REASONS[reason] ?? reason)
    }

    await sleep(12_000)
  }
  throw new PermanentPublishError('TikTok publish status polling timed out')
}

async function initDirectVideo(
  accessToken: string,
  input: { title: string; privacyLevel: string; videoUrl: string; creator: CreatorInfo },
): Promise<string> {
  const privateOnly = input.privacyLevel === 'SELF_ONLY'
  const data = await tikTokPost('https://open.tiktokapis.com/v2/post/publish/video/init/', accessToken, {
    post_info: {
      title: input.title || undefined,
      privacy_level: input.privacyLevel,
      disable_duet: privateOnly || input.creator.duetDisabled,
      disable_comment: input.creator.commentDisabled,
      disable_stitch: privateOnly || input.creator.stitchDisabled,
      brand_content_toggle: false,
      brand_organic_toggle: false,
    },
    source_info: {
      source: 'PULL_FROM_URL',
      video_url: input.videoUrl,
    },
  })
  return parseData(initSchema, data, 'video init').publish_id
}

async function initInboxVideo(accessToken: string, videoUrl: string): Promise<string> {
  const data = await tikTokPost(
    'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/',
    accessToken,
    {
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: videoUrl,
      },
    },
  )
  return parseData(initSchema, data, 'inbox init').publish_id
}

async function initDirectPhotos(
  accessToken: string,
  input: { caption: string; privacyLevel: string; imageUrls: string[]; creator: CreatorInfo },
): Promise<string> {
  const data = await tikTokPost('https://open.tiktokapis.com/v2/post/publish/content/init/', accessToken, {
    post_info: {
      title: input.caption.slice(0, 90) || undefined,
      description: input.caption.slice(0, 4000) || undefined,
      privacy_level: input.privacyLevel,
      disable_comment: input.creator.commentDisabled,
      auto_add_music: true,
      brand_content_toggle: false,
      brand_organic_toggle: false,
    },
    source_info: {
      source: 'PULL_FROM_URL',
      photo_cover_index: 0,
      photo_images: input.imageUrls,
    },
    post_mode: 'DIRECT_POST',
    media_type: 'PHOTO',
  })
  return parseData(initSchema, data, 'photo init').publish_id
}

async function initInboxPhotos(accessToken: string, caption: string, imageUrls: string[]): Promise<string> {
  const data = await tikTokPost('https://open.tiktokapis.com/v2/post/publish/content/init/', accessToken, {
    post_info: {
      title: caption.slice(0, 90) || undefined,
      description: caption.slice(0, 4000) || undefined,
    },
    source_info: {
      source: 'PULL_FROM_URL',
      photo_cover_index: 0,
      photo_images: imageUrls,
    },
    post_mode: 'MEDIA_UPLOAD',
    media_type: 'PHOTO',
  })
  return parseData(initSchema, data, 'photo inbox init').publish_id
}

async function publishWithFallback(
  ctx: PublishContext,
  direct: (privacyLevel: string) => Promise<string>,
  inbox: () => Promise<string>,
  creator: CreatorInfo,
): Promise<PublishResult> {
  let lastError: unknown
  for (const privacyLevel of privacyLevelsToTry(creator.privacyLevelOptions)) {
    try {
      const publishId = await direct(privacyLevel)
      await ctx.persistOperationId?.(publishId)
      return waitForPublish(ctx.accessToken, publishId)
    } catch (error) {
      lastError = error
      if (!isUnauditedClientError(error)) rethrowTikTok(error)
    }
  }

  if (isUnauditedClientError(lastError) && hasUploadScope(ctx)) {
    const publishId = await inbox()
    await ctx.persistOperationId?.(publishId)
    return waitForPublish(ctx.accessToken, publishId)
  }

  rethrowTikTok(lastError)
}

async function publishVideo(ctx: PublishContext): Promise<PublishResult> {
  const creator = await queryCreatorInfo(ctx.accessToken)
  assertVideoDuration(ctx.post, creator)
  const title = getCaption(ctx.post).slice(0, 2200)
  const videoUrl = getMediaUrl(ctx.post)

  return publishWithFallback(
    ctx,
    privacyLevel => initDirectVideo(ctx.accessToken, { title, privacyLevel, videoUrl, creator }),
    () => initInboxVideo(ctx.accessToken, videoUrl),
    creator,
  )
}

async function publishPhotos(ctx: PublishContext, imageUrls: string[]): Promise<PublishResult> {
  if (imageUrls.length > 35) {
    throw new PermanentPublishError('TikTok photo posts support up to 35 images')
  }
  const [creator, preparedUrls] = await Promise.all([
    queryCreatorInfo(ctx.accessToken),
    prepareTikTokImages(ctx, imageUrls),
  ])
  const caption = getCaption(ctx.post)

  return publishWithFallback(
    ctx,
    privacyLevel =>
      initDirectPhotos(ctx.accessToken, { caption, privacyLevel, imageUrls: preparedUrls, creator }),
    () => initInboxPhotos(ctx.accessToken, caption, preparedUrls),
    creator,
  )
}

export async function publishTikTokPost(ctx: PublishContext): Promise<PublishResult> {
  assertSupportedType(ctx.account.provider, ctx.post.type, [
    PostType.IMAGE,
    PostType.VIDEO,
    PostType.REEL,
    PostType.CAROUSEL,
  ])

  try {
    if (ctx.post.type === PostType.VIDEO || ctx.post.type === PostType.REEL) {
      return await publishVideo(ctx)
    }

    if (ctx.post.type === PostType.IMAGE) {
      return await publishPhotos(ctx, [getMediaUrl(ctx.post)])
    }

    const items = getCarouselItems(ctx.post)
    if (items.some(item => item.kind === 'video')) {
      throw new PermanentPublishError('TikTok photo posts cannot include videos')
    }
    return await publishPhotos(
      ctx,
      items.map(item => item.url),
    )
  } catch (error) {
    rethrowTikTok(error)
  }
}
