import { PostType } from '@socialista/db'
import { z } from 'zod'

import { fetchJson, sleep } from './fetch.js'
import {
  assertSupportedType,
  getCaption,
  getCarouselItems,
  getMediaUrl,
  PermanentPublishError,
  type PublishContext,
  type PublishResult,
} from './types.js'

const creatorInfoSchema = z.object({
  data: z
    .object({
      privacy_level_options: z.array(z.string()).optional(),
    })
    .passthrough(),
})

const initSchema = z.object({
  data: z.object({
    publish_id: z.string().min(1),
  }),
})

const statusSchema = z.object({
  data: z.object({
    status: z.string(),
    fail_reason: z.string().optional(),
    publicaly_available_post_id: z.array(z.union([z.string(), z.number()])).optional(),
  }),
})

async function queryCreatorInfo(accessToken: string): Promise<string> {
  const info = await fetchJson(
    'https://open.tiktokapis.com/v2/post/publish/creator_info/query/',
    creatorInfoSchema,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: '{}',
    },
  )

  const options = info.data.privacy_level_options ?? []
  if (options.includes('PUBLIC_TO_EVERYONE')) return 'PUBLIC_TO_EVERYONE'
  if (options.includes('FOLLOWER_OF_CREATOR')) return 'FOLLOWER_OF_CREATOR'
  if (options.includes('MUTUAL_FOLLOW_FRIENDS')) return 'MUTUAL_FOLLOW_FRIENDS'
  if (options.includes('SELF_ONLY')) return 'SELF_ONLY'
  if (options[0]) return options[0]
  throw new PermanentPublishError('TikTok creator info did not return a privacy level')
}

async function waitForPublish(accessToken: string, publishId: string): Promise<PublishResult> {
  const maxAttempts = 90
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await fetchJson(
      'https://open.tiktokapis.com/v2/post/publish/status/fetch/',
      statusSchema,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({ publish_id: publishId }),
      },
    )

    const code = status.data.status.toUpperCase()
    if (code === 'PUBLISH_COMPLETE') {
      const postId = status.data.publicaly_available_post_id?.[0]
      return {
        providerPostId: postId !== undefined ? String(postId) : publishId,
        providerOperationId: publishId,
      }
    }
    if (code === 'FAILED') {
      throw new PermanentPublishError(status.data.fail_reason || 'TikTok publish failed')
    }
    await sleep(2000)
  }
  throw new PermanentPublishError('TikTok publish status polling timed out')
}

async function publishVideo(ctx: PublishContext): Promise<PublishResult> {
  const privacyLevel = await queryCreatorInfo(ctx.accessToken)
  const title = getCaption(ctx.post).slice(0, 2200)

  const init = await fetchJson(
    'https://open.tiktokapis.com/v2/post/publish/video/init/',
    initSchema,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ctx.accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: {
          title,
          privacy_level: privacyLevel,
          disable_duet: false,
          disable_comment: false,
          disable_stitch: false,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: getMediaUrl(ctx.post),
        },
      }),
    },
  )

  await ctx.persistOperationId?.(init.data.publish_id)
  return waitForPublish(ctx.accessToken, init.data.publish_id)
}

async function publishPhotos(ctx: PublishContext, imageUrls: string[]): Promise<PublishResult> {
  const privacyLevel = await queryCreatorInfo(ctx.accessToken)
  const caption = getCaption(ctx.post)

  const init = await fetchJson(
    'https://open.tiktokapis.com/v2/post/publish/content/init/',
    initSchema,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ctx.accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: {
          title: caption.slice(0, 90),
          description: caption.slice(0, 4000),
          privacy_level: privacyLevel,
          disable_comment: false,
          auto_add_music: true,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          photo_cover_index: 0,
          photo_images: imageUrls,
        },
        post_mode: 'DIRECT_POST',
        media_type: 'PHOTO',
      }),
    },
  )

  await ctx.persistOperationId?.(init.data.publish_id)
  return waitForPublish(ctx.accessToken, init.data.publish_id)
}

export async function publishTikTokPost(ctx: PublishContext): Promise<PublishResult> {
  assertSupportedType(ctx.account.provider, ctx.post.type, [
    PostType.IMAGE,
    PostType.VIDEO,
    PostType.REEL,
    PostType.CAROUSEL,
  ])

  if (ctx.post.type === PostType.VIDEO || ctx.post.type === PostType.REEL) {
    return publishVideo(ctx)
  }

  if (ctx.post.type === PostType.IMAGE) {
    return publishPhotos(ctx, [getMediaUrl(ctx.post)])
  }

  const items = getCarouselItems(ctx.post)
  if (items.some(item => item.kind === 'video')) {
    throw new PermanentPublishError('TikTok photo posts cannot include videos')
  }
  return publishPhotos(
    ctx,
    items.map(item => item.url),
  )
}
