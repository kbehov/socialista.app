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

const LINKEDIN_VERSION = process.env.LINKEDIN_API_VERSION ?? '202506'

const registerUploadSchema = z.object({
  value: z.object({
    uploadMechanism: z
      .object({
        'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest': z
          .object({
            uploadUrl: z.string().url(),
          })
          .optional(),
      })
      .optional(),
    asset: z.string().optional(),
  }),
})

const imageUploadSchema = z.object({
  value: z
    .object({
      uploadUrl: z.string().url().optional(),
      image: z.string().optional(),
    })
    .passthrough(),
})

function linkedInHeaders(accessToken: string, extra?: Record<string, string>): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    'LinkedIn-Version': LINKEDIN_VERSION,
    'X-Restli-Protocol-Version': '2.0.0',
    ...extra,
  }
}

function authorUrn(account: PublishContext['account']): string {
  const personId = account.providerAccountId
  if (personId.startsWith('urn:')) return personId
  return `urn:li:person:${personId}`
}

async function uploadImage(ctx: PublishContext, imageUrl: string): Promise<string> {
  // Prefer Images API initializeUpload when available; fall back to assets registerUpload.
  try {
    const init = await fetchJson('https://api.linkedin.com/rest/images?action=initializeUpload', imageUploadSchema, {
      method: 'POST',
      headers: linkedInHeaders(ctx.accessToken, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        initializeUploadRequest: {
          owner: authorUrn(ctx.account),
        },
      }),
    })

    const uploadUrl = init.value.uploadUrl
    const imageUrn = init.value.image
    if (!uploadUrl || !imageUrn) {
      throw new PermanentPublishError('LinkedIn image upload initialization failed')
    }

    const { buffer, contentType } = await fetchBinary(imageUrl)
    const uploaded = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${ctx.accessToken}`,
        'Content-Type': contentType,
      },
      body: buffer,
    })
    if (!uploaded.ok) {
      throw new PermanentPublishError(`LinkedIn image binary upload failed (${uploaded.status})`)
    }
    return imageUrn
  } catch {
    const registered = await fetchJson(
      'https://api.linkedin.com/v2/assets?action=registerUpload',
      registerUploadSchema,
      {
        method: 'POST',
        headers: linkedInHeaders(ctx.accessToken, { 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          registerUploadRequest: {
            recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
            owner: authorUrn(ctx.account),
            serviceRelationships: [
              {
                relationshipType: 'OWNER',
                identifier: 'urn:li:userGeneratedContent',
              },
            ],
          },
        }),
      },
    )

    const uploadUrl =
      registered.value.uploadMechanism?.[
        'com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest'
      ]?.uploadUrl
    const asset = registered.value.asset
    if (!uploadUrl || !asset) {
      throw new PermanentPublishError('LinkedIn asset registration failed')
    }

    const { buffer, contentType } = await fetchBinary(imageUrl)
    const uploaded = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ctx.accessToken}`,
        'Content-Type': contentType,
      },
      body: buffer,
    })
    if (!uploaded.ok) {
      throw new PermanentPublishError(`LinkedIn asset binary upload failed (${uploaded.status})`)
    }
    return asset
  }
}

async function uploadVideo(ctx: PublishContext, videoUrl: string): Promise<string> {
  const { buffer, contentType } = await fetchBinary(videoUrl)

  const init = await fetchJson(
    'https://api.linkedin.com/rest/videos?action=initializeUpload',
    z.object({
      value: z.object({
        uploadInstructions: z
          .array(
            z.object({
              uploadUrl: z.string().url(),
              firstByte: z.number().optional(),
              lastByte: z.number().optional(),
            }),
          )
          .min(1),
        video: z.string().min(1),
      }),
    }),
    {
      method: 'POST',
      headers: linkedInHeaders(ctx.accessToken, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        initializeUploadRequest: {
          owner: authorUrn(ctx.account),
          fileSizeBytes: buffer.byteLength,
          uploadCaptions: false,
          uploadThumbnail: false,
        },
      }),
    },
  )

  const instruction = init.value.uploadInstructions[0]
  if (!instruction) {
    throw new PermanentPublishError('LinkedIn video upload instructions missing')
  }

  const uploaded = await fetch(instruction.uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: buffer,
  })
  if (!uploaded.ok) {
    throw new PermanentPublishError(`LinkedIn video binary upload failed (${uploaded.status})`)
  }

  // Give LinkedIn a moment to process short uploads.
  await sleep(1500)
  return init.value.video
}

async function createPost(
  ctx: PublishContext,
  content: Record<string, unknown> | undefined,
): Promise<PublishResult> {
  const commentary = getCaption(ctx.post) || getTextBody(ctx.post)
  const response = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: linkedInHeaders(ctx.accessToken, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      author: authorUrn(ctx.account),
      commentary,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      ...(content ? { content } : {}),
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false,
    }),
  })

  if (!response.ok) {
    const payload = await response.json().catch(() => null)
    const message =
      payload && typeof payload === 'object' && 'message' in payload
        ? String((payload as { message: unknown }).message)
        : response.statusText
    throw new PermanentPublishError(message || 'LinkedIn publish failed')
  }

  const providerPostId = response.headers.get('x-restli-id') ?? response.headers.get('X-RestLi-Id')
  if (!providerPostId) {
    throw new PermanentPublishError('LinkedIn publish succeeded without a post id')
  }

  return {
    providerPostId,
    providerPermalink: `https://www.linkedin.com/feed/update/${providerPostId}`,
  }
}

export async function publishLinkedInPost(ctx: PublishContext): Promise<PublishResult> {
  assertSupportedType(ctx.account.provider, ctx.post.type, [
    PostType.TEXT,
    PostType.IMAGE,
    PostType.VIDEO,
    PostType.CAROUSEL,
  ])

  if (ctx.post.type === PostType.TEXT) {
    const text = getTextBody(ctx.post)
    if (!text) throw new PermanentPublishError('LinkedIn text posts require a body or caption')
    return createPost(ctx, undefined)
  }

  if (ctx.post.type === PostType.IMAGE) {
    const imageUrn = await uploadImage(ctx, getMediaUrl(ctx.post))
    await ctx.persistOperationId?.(imageUrn)
    return createPost(ctx, {
      media: {
        title: getCaption(ctx.post).slice(0, 200) || 'Image',
        id: imageUrn,
      },
    })
  }

  if (ctx.post.type === PostType.VIDEO) {
    const videoUrn = await uploadVideo(ctx, getMediaUrl(ctx.post))
    await ctx.persistOperationId?.(videoUrn)
    return createPost(ctx, {
      media: {
        title: getCaption(ctx.post).slice(0, 200) || 'Video',
        id: videoUrn,
      },
    })
  }

  const items = getCarouselItems(ctx.post)
  if (items.some(item => item.kind === 'video')) {
    throw new PermanentPublishError('LinkedIn organic multi-image posts cannot include videos')
  }
  if (items.length < 2) {
    throw new PermanentPublishError('LinkedIn multi-image posts require at least 2 images')
  }

  const imageUrns: string[] = []
  for (const item of items) {
    imageUrns.push(await uploadImage(ctx, item.url))
  }
  await ctx.persistOperationId?.(imageUrns.join(','))

  return createPost(ctx, {
    multiImage: {
      images: imageUrns.map(id => ({ id })),
    },
  })
}
