import { PostType } from '@socialista/db'
import { z } from 'zod'

import { fetchJson, sleep } from './fetch.js'
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

const containerSchema = z.object({
  id: z.string().min(1),
})

const statusSchema = z.object({
  status: z.string().optional(),
  error_message: z.string().optional(),
})

const publishSchema = z.object({
  id: z.string().min(1),
})

function threadsUserId(account: PublishContext['account']): string {
  return account.providerAccountId
}

async function waitForContainer(containerId: string, accessToken: string): Promise<void> {
  const maxAttempts = 60
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const status = await fetchJson(`https://graph.threads.net/v1.0/${containerId}`, statusSchema, {
      searchParams: {
        fields: 'status,error_message',
        access_token: accessToken,
      },
    })
    const code = (status.status ?? '').toUpperCase()
    if (code === 'FINISHED' || code === 'PUBLISHED') return
    if (code === 'ERROR' || code === 'EXPIRED') {
      throw new PermanentPublishError(
        status.error_message || `Threads media container failed with status ${code}`,
      )
    }
    await sleep(2000)
  }
  throw new PermanentPublishError('Threads media container processing timed out')
}

async function createContainer(
  ctx: PublishContext,
  params: Record<string, string>,
): Promise<string> {
  const created = await fetchJson(
    `https://graph.threads.net/v1.0/${threadsUserId(ctx.account)}/threads`,
    containerSchema,
    {
      method: 'POST',
      searchParams: {
        ...params,
        access_token: ctx.accessToken,
      },
    },
  )
  await ctx.persistOperationId?.(created.id)
  await waitForContainer(created.id, ctx.accessToken)
  return created.id
}

async function publishContainer(ctx: PublishContext, creationId: string): Promise<PublishResult> {
  const published = await fetchJson(
    `https://graph.threads.net/v1.0/${threadsUserId(ctx.account)}/threads_publish`,
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
    providerPermalink: `https://www.threads.net/t/${published.id}`,
  }
}

export async function publishThreadsPost(ctx: PublishContext): Promise<PublishResult> {
  assertSupportedType(ctx.account.provider, ctx.post.type, [
    PostType.TEXT,
    PostType.IMAGE,
    PostType.VIDEO,
    PostType.CAROUSEL,
  ])

  if (ctx.post.type === PostType.TEXT) {
    const text = getTextBody(ctx.post)
    if (!text) throw new PermanentPublishError('Threads text posts require a body or caption')
    const creationId = await createContainer(ctx, {
      media_type: 'TEXT',
      text,
    })
    return publishContainer(ctx, creationId)
  }

  if (ctx.post.type === PostType.IMAGE) {
    const creationId = await createContainer(ctx, {
      media_type: 'IMAGE',
      image_url: getMediaUrl(ctx.post),
      text: getCaption(ctx.post),
    })
    return publishContainer(ctx, creationId)
  }

  if (ctx.post.type === PostType.VIDEO) {
    const creationId = await createContainer(ctx, {
      media_type: 'VIDEO',
      video_url: getMediaUrl(ctx.post),
      text: getCaption(ctx.post),
    })
    return publishContainer(ctx, creationId)
  }

  const items = getCarouselItems(ctx.post)
  if (items.length < 2 || items.length > 20) {
    throw new PermanentPublishError('Threads carousels require between 2 and 20 items')
  }

  const childIds: string[] = []
  for (const item of items) {
    const childId = await createContainer(ctx, {
      is_carousel_item: 'true',
      media_type: item.kind === 'video' ? 'VIDEO' : 'IMAGE',
      ...(item.kind === 'video' ? { video_url: item.url } : { image_url: item.url }),
    })
    childIds.push(childId)
  }

  const carouselId = await createContainer(ctx, {
    media_type: 'CAROUSEL',
    children: childIds.join(','),
    text: getCaption(ctx.post),
  })

  return publishContainer(ctx, carouselId)
}
