import { PostType } from '@socialista/db'
import { z } from 'zod'

import { fetchJson, PublishHttpError } from './fetch.js'
import {
  AmbiguousPublishError,
  assertSupportedType,
  getCaption,
  getCarouselItems,
  getMediaUrl,
  getTextBody,
  graphVersion,
  PermanentPublishError,
  type PublishContext,
  type PublishResult,
} from './types.js'

const idSchema = z.object({
  id: z.string().min(1),
})

const photoSchema = z.object({
  id: z.string().min(1),
  post_id: z.string().optional(),
})

function pageId(account: PublishContext['account']): string {
  const fromMeta = account.metadata?.pageId
  if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta.trim()
  return account.providerAccountId
}

function graphUrl(path: string): string {
  return `https://graph.facebook.com/${graphVersion()}${path}`
}

async function publishText(ctx: PublishContext): Promise<PublishResult> {
  const message = getTextBody(ctx.post)
  if (!message) throw new PermanentPublishError('Facebook text posts require a body or caption')

  const result = await fetchJson(graphUrl(`/${pageId(ctx.account)}/feed`), idSchema, {
    method: 'POST',
    searchParams: {
      message,
      access_token: ctx.accessToken,
    },
  })

  return {
    providerPostId: result.id,
    providerPermalink: `https://www.facebook.com/${result.id}`,
  }
}

async function publishPhoto(ctx: PublishContext): Promise<PublishResult> {
  const result = await fetchJson(graphUrl(`/${pageId(ctx.account)}/photos`), photoSchema, {
    method: 'POST',
    searchParams: {
      url: getMediaUrl(ctx.post),
      caption: getCaption(ctx.post),
      access_token: ctx.accessToken,
    },
  })

  const providerPostId = result.post_id ?? result.id
  return {
    providerPostId,
    providerPermalink: `https://www.facebook.com/${providerPostId}`,
    providerOperationId: result.id,
  }
}

async function publishVideo(ctx: PublishContext, asReel: boolean): Promise<PublishResult> {
  const params: Record<string, string> = {
    file_url: getMediaUrl(ctx.post),
    description: getCaption(ctx.post),
    access_token: ctx.accessToken,
  }
  if (asReel) {
    params.published = 'true'
  }

  try {
    const result = await fetchJson(graphUrl(`/${pageId(ctx.account)}/videos`), idSchema, {
      method: 'POST',
      searchParams: params,
    })
    return {
      providerPostId: result.id,
      providerPermalink: `https://www.facebook.com/${result.id}`,
      providerOperationId: result.id,
    }
  } catch (error) {
    if (error instanceof PublishHttpError && error.status === 0) {
      throw new AmbiguousPublishError('Facebook video upload timed out with unknown outcome')
    }
    throw error
  }
}

async function publishCarousel(ctx: PublishContext): Promise<PublishResult> {
  const items = getCarouselItems(ctx.post)
  const attachedMedia: Array<{ media_fbid: string }> = []

  for (const item of items) {
    if (item.kind !== 'image') {
      throw new PermanentPublishError('Facebook carousel posts currently support images only')
    }
    const uploaded = await fetchJson(graphUrl(`/${pageId(ctx.account)}/photos`), idSchema, {
      method: 'POST',
      searchParams: {
        url: item.url,
        published: 'false',
        access_token: ctx.accessToken,
      },
    })
    attachedMedia.push({ media_fbid: uploaded.id })
  }

  const result = await fetchJson(graphUrl(`/${pageId(ctx.account)}/feed`), idSchema, {
    method: 'POST',
    searchParams: {
      message: getCaption(ctx.post),
      attached_media: JSON.stringify(attachedMedia),
      access_token: ctx.accessToken,
    },
  })

  return {
    providerPostId: result.id,
    providerPermalink: `https://www.facebook.com/${result.id}`,
  }
}

export async function publishFacebookPost(ctx: PublishContext): Promise<PublishResult> {
  assertSupportedType(ctx.account.provider, ctx.post.type, [
    PostType.TEXT,
    PostType.IMAGE,
    PostType.VIDEO,
    PostType.REEL,
    PostType.CAROUSEL,
  ])

  switch (ctx.post.type) {
    case PostType.TEXT:
      return publishText(ctx)
    case PostType.IMAGE:
      return publishPhoto(ctx)
    case PostType.VIDEO:
      return publishVideo(ctx, false)
    case PostType.REEL:
      return publishVideo(ctx, true)
    case PostType.CAROUSEL:
      return publishCarousel(ctx)
    default:
      throw new PermanentPublishError(`Unsupported Facebook post type: ${ctx.post.type}`)
  }
}
