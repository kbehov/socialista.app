import { PostType } from '@socialista/db'
import { z } from 'zod'

import { fetchJson, sleep } from './fetch.js'
import {
  assertSupportedType,
  getCaption,
  getCarouselItems,
  getMediaUrl,
  graphVersion,
  PermanentPublishError,
  type PublishContext,
  type PublishResult,
} from './types.js'

const containerSchema = z.object({
  id: z.string().min(1),
})

const statusSchema = z.object({
  status_code: z.string().optional(),
  status: z.string().optional(),
})

const publishSchema = z.object({
  id: z.string().min(1),
})

function igUserId(account: PublishContext['account']): string {
  const fromMeta = account.metadata?.igUserId
  if (typeof fromMeta === 'string' && fromMeta.trim()) return fromMeta.trim()
  return account.providerAccountId
}

function graphHost(account: PublishContext['account']): string {
  const tokenKind = account.metadata?.tokenKind
  // Instagram Login tokens use graph.instagram.com; Page-linked IG uses graph.facebook.com.
  if (tokenKind === 'instagram_user_access_token' || tokenKind === 'instagram_login') {
    return `https://graph.instagram.com/${graphVersion()}`
  }
  return `https://graph.facebook.com/${graphVersion()}`
}

async function waitForContainer(
  baseUrl: string,
  containerId: string,
  accessToken: string,
): Promise<void> {
  const maxAttempts = 60
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await fetchJson(`${baseUrl}/${containerId}`, statusSchema, {
      searchParams: {
        fields: 'status_code',
        access_token: accessToken,
      },
    })
    const code = (status.status_code ?? status.status ?? '').toUpperCase()
    if (code === 'FINISHED' || code === 'PUBLISHED') return
    if (code === 'ERROR' || code === 'EXPIRED') {
      throw new PermanentPublishError(`Instagram media container failed with status ${code}`)
    }
    await sleep(2000)
  }
  throw new PermanentPublishError('Instagram media container processing timed out')
}

async function createContainer(
  ctx: PublishContext,
  params: Record<string, string>,
): Promise<string> {
  const base = graphHost(ctx.account)
  const created = await fetchJson(`${base}/${igUserId(ctx.account)}/media`, containerSchema, {
    method: 'POST',
    searchParams: {
      ...params,
      access_token: ctx.accessToken,
    },
  })
  await ctx.persistOperationId?.(created.id)
  await waitForContainer(base, created.id, ctx.accessToken)
  return created.id
}

async function publishContainer(ctx: PublishContext, creationId: string): Promise<PublishResult> {
  const base = graphHost(ctx.account)
  const published = await fetchJson(
    `${base}/${igUserId(ctx.account)}/media_publish`,
    publishSchema,
    {
      method: 'POST',
      searchParams: {
        creation_id: creationId,
        access_token: ctx.accessToken,
      },
    },
  )

  return {
    providerPostId: published.id,
    providerOperationId: creationId,
    providerPermalink: `https://www.instagram.com/p/${published.id}/`,
  }
}

export async function publishInstagramPost(ctx: PublishContext): Promise<PublishResult> {
  assertSupportedType(ctx.account.provider, ctx.post.type, [
    PostType.IMAGE,
    PostType.VIDEO,
    PostType.REEL,
    PostType.CAROUSEL,
  ])

  const caption = getCaption(ctx.post)

  if (ctx.post.type === PostType.IMAGE) {
    const creationId = await createContainer(ctx, {
      image_url: getMediaUrl(ctx.post),
      caption,
    })
    return publishContainer(ctx, creationId)
  }

  if (ctx.post.type === PostType.VIDEO || ctx.post.type === PostType.REEL) {
    const creationId = await createContainer(ctx, {
      video_url: getMediaUrl(ctx.post),
      caption,
      media_type: ctx.post.type === PostType.REEL ? 'REELS' : 'VIDEO',
    })
    return publishContainer(ctx, creationId)
  }

  const items = getCarouselItems(ctx.post)
  if (items.length < 2) {
    throw new PermanentPublishError('Instagram carousels require at least 2 items')
  }

  const childIds: string[] = []
  for (const item of items) {
    const childParams: Record<string, string> = {
      is_carousel_item: 'true',
    }
    if (item.kind === 'video') {
      childParams.video_url = item.url
      childParams.media_type = 'VIDEO'
    } else {
      childParams.image_url = item.url
    }
    const childId = await createContainer(ctx, childParams)
    childIds.push(childId)
  }

  const carouselId = await createContainer(ctx, {
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    caption,
  })

  return publishContainer(ctx, carouselId)
}
