import {
  assertFutureScheduleInstant,
  assertHasUpdates,
  optionalTrimmedString,
  parseOptionalDate,
  parseOptionalNullableDate,
  parseParamId,
  toNullableDate,
} from '@/utils/common.utils.js'
import { HttpError } from '@/utils/http-response.js'
import { getAccountOrThrow } from '@/utils/account.utils.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  assertValidTimezone,
  PostStatus,
  PostType,
  SocialProvider,
  getPostById,
  type CreatePostInput,
  type IPost,
  type PostContent,
  type UpdatePostInput,
} from '@socialista/db'
import type {
  CreatePostPayload,
  Post,
  PostStatus as ApiPostStatus,
  PostType as ApiPostType,
  SchedulePostPayload,
  UpdatePostPayload,
} from '@socialista/types'
import { isPublishablePostType } from '@socialista/types'

const POST_TYPES = new Set<string>(Object.values(PostType))
const POST_STATUSES = new Set<string>(Object.values(PostStatus))
const SOCIAL_PROVIDERS = new Set<string>(Object.values(SocialProvider))
const PUBLIC_UPDATE_STATUSES = new Set<ApiPostStatus>(['draft', 'scheduled', 'canceled'])

export const isPostType = (value: unknown): value is ApiPostType =>
  typeof value === 'string' && POST_TYPES.has(value)

export const isPostStatus = (value: unknown): value is ApiPostStatus =>
  typeof value === 'string' && POST_STATUSES.has(value)

const isSocialProvider = (value: unknown): value is SocialProvider =>
  typeof value === 'string' && SOCIAL_PROVIDERS.has(value)

function parsePostContent(value: unknown): PostContent {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(400, 'Post content is required')
  }
  const content = value as Record<string, unknown>

  if (typeof content.body === 'string') {
    if (!content.body.trim()) throw new HttpError(400, 'Post body cannot be empty')
    return { body: content.body }
  }

  if (content.media && typeof content.media === 'object') {
    const media = content.media as Record<string, unknown>
    if (typeof media.url !== 'string' || !media.url.trim()) {
      throw new HttpError(400, 'Media URL is required')
    }
    const url = media.url.trim()
    if (typeof media.durationSeconds === 'number') {
      return {
        media: {
          url,
          thumbnailUrl: optionalTrimmedString(media.thumbnailUrl),
          durationSeconds: media.durationSeconds,
        },
      }
    }
    return {
      media: {
        url,
        altText: optionalTrimmedString(media.altText),
      },
    }
  }

  if (Array.isArray(content.items)) {
    if (content.items.length === 0) {
      throw new HttpError(400, 'Carousel must contain at least one item')
    }
    const items = content.items.map((raw, index) => {
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        throw new HttpError(400, `Carousel item ${index + 1} is invalid`)
      }
      const item = raw as Record<string, unknown>
      const url = optionalTrimmedString(item.url)
      if (!url) throw new HttpError(400, `Carousel item ${index + 1} URL is required`)
      if (item.kind === 'video') {
        return {
          kind: 'video' as const,
          url,
          thumbnailUrl: optionalTrimmedString(item.thumbnailUrl),
          durationSeconds:
            typeof item.durationSeconds === 'number' && Number.isFinite(item.durationSeconds)
              ? item.durationSeconds
              : undefined,
        }
      }
      return {
        kind: 'image' as const,
        url,
        altText: optionalTrimmedString(item.altText),
      }
    })
    return { items }
  }

  throw new HttpError(400, 'Unsupported post content shape')
}

export const serializePost = (post: IPost): Post => ({
  _id: post._id.toString(),
  accountId: post.account.toString(),
  workspaceId: post.workspace.toString(),
  createdBy: post.createdBy.toString(),
  provider: post.provider,
  type: post.type,
  status: post.status,
  content: post.content as PostContent,
  caption: post.caption,
  description: post.description,
  scheduledAt: post.scheduledAt,
  timezone: post.timezone,
  publishedAt: post.publishedAt,
  failureReason: post.failureReason,
  scheduleRevision: post.scheduleRevision ?? 0,
  providerPostId: post.providerPostId,
  providerPermalink: post.providerPermalink,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
})

export const assertProviderSupportsPostType = (
  provider: SocialProvider,
  type: ApiPostType,
): void => {
  if (!isPublishablePostType(provider, type)) {
    throw new HttpError(400, `${provider} does not support ${type} posts`)
  }
}

function parseOptionalTimezone(value: unknown): string | undefined {
  const timezone = optionalTrimmedString(value)
  if (!timezone) return undefined
  try {
    return assertValidTimezone(timezone)
  } catch {
    throw new HttpError(400, 'Valid IANA timezone is required')
  }
}

export const parseCreatePostInput = (body: Record<string, unknown>): CreatePostPayload => {
  const workspaceId = parseParamId(
    typeof body.workspaceId === 'string' ? body.workspaceId : undefined,
    'workspace ID',
  )
  const accountId = parseParamId(
    typeof body.accountId === 'string' ? body.accountId : undefined,
    'account ID',
  )

  if (!isSocialProvider(body.provider)) {
    throw new HttpError(400, 'Valid social provider is required')
  }
  if (!isPostType(body.type)) {
    throw new HttpError(400, 'Valid post type is required')
  }
  if (body.status !== undefined) {
    if (!isPostStatus(body.status) || !PUBLIC_UPDATE_STATUSES.has(body.status)) {
      throw new HttpError(400, 'Invalid post status')
    }
  }

  assertProviderSupportsPostType(body.provider, body.type)

  const content = parsePostContent(body.content)

  return {
    workspaceId,
    accountId,
    provider: body.provider,
    type: body.type,
    content,
    timezone: parseOptionalTimezone(body.timezone),
    status: isPostStatus(body.status) && PUBLIC_UPDATE_STATUSES.has(body.status) ? body.status : undefined,
    caption: optionalTrimmedString(body.caption),
    description: optionalTrimmedString(body.description),
    scheduledAt: parseOptionalDate(body.scheduledAt, 'scheduled at'),
    publishedAt: parseOptionalDate(body.publishedAt, 'published at'),
    failureReason: optionalTrimmedString(body.failureReason),
  }
}

export const parseUpdatePostInput = (body: Record<string, unknown>): UpdatePostPayload => {
  const updates: UpdatePostPayload = {}

  if (body.type !== undefined) {
    if (!isPostType(body.type)) throw new HttpError(400, 'Invalid post type')
    updates.type = body.type
  }

  if (body.content !== undefined) {
    updates.content = parsePostContent(body.content)
  }

  if (body.status !== undefined) {
    if (!isPostStatus(body.status) || !PUBLIC_UPDATE_STATUSES.has(body.status)) {
      throw new HttpError(400, 'Invalid post status')
    }
    updates.status = body.status as 'draft' | 'scheduled' | 'canceled'
  }

  if (body.timezone !== undefined) {
    updates.timezone = parseOptionalTimezone(body.timezone)
  }

  if (body.caption !== undefined) {
    updates.caption = body.caption === null ? null : optionalTrimmedString(body.caption)
  }

  if (body.description !== undefined) {
    updates.description = body.description === null ? null : optionalTrimmedString(body.description)
  }

  if (body.scheduledAt !== undefined) {
    updates.scheduledAt = parseOptionalNullableDate(body.scheduledAt, 'scheduled at')
  }

  if (body.publishedAt !== undefined) {
    throw new HttpError(400, 'publishedAt cannot be set via the public API')
  }

  if (body.failureReason !== undefined) {
    throw new HttpError(400, 'failureReason cannot be set via the public API')
  }

  assertHasUpdates(updates)
  return updates
}

export const parseSchedulePostInput = (body: Record<string, unknown>): SchedulePostPayload => {
  const scheduledAt = parseOptionalDate(body.scheduledAt, 'scheduled at')
  if (!scheduledAt) {
    throw new HttpError(400, 'scheduledAt is required')
  }
  assertFutureScheduleInstant(scheduledAt)
  return {
    scheduledAt,
    timezone: parseOptionalTimezone(body.timezone),
  }
}

export const toCreatePostInput = (
  input: CreatePostPayload,
  userId: string,
  timezone: string,
): CreatePostInput => ({
  account: input.accountId,
  workspace: input.workspaceId,
  createdBy: userId,
  provider: input.provider as SocialProvider,
  type: input.type as PostType,
  content: input.content,
  timezone,
  status: input.status as PostStatus | undefined,
  caption: input.caption,
  description: input.description,
  scheduledAt: toNullableDate(input.scheduledAt) ?? undefined,
  publishedAt: toNullableDate(input.publishedAt) ?? undefined,
  failureReason: input.failureReason,
})

export const toUpdatePostInput = (input: UpdatePostPayload): UpdatePostInput => ({
  type: input.type as PostType | undefined,
  content: input.content,
  status: input.status as PostStatus | undefined,
  timezone: input.timezone,
  caption: input.caption,
  description: input.description,
  scheduledAt: toNullableDate(input.scheduledAt) ?? undefined,
})

/** Load a post and verify the caller is a member of its workspace. */
export const getPostForMember = async (id: string, userId: string): Promise<IPost> => {
  const post = await getPostById(id)
  if (!post) {
    throw new HttpError(404, 'Post not found')
  }
  await getWorkspaceAsMember(post.workspace.toString(), userId)
  return post
}

/** Resolve the timezone to use for a new post: explicit payload → account.timezone. */
export const resolvePostTimezone = async (
  payloadTimezone: string | undefined,
  accountId: string,
): Promise<string> => {
  if (payloadTimezone) {
    try {
      return assertValidTimezone(payloadTimezone)
    } catch {
      throw new HttpError(400, 'Valid IANA timezone is required')
    }
  }
  const account = await getAccountOrThrow(accountId)
  return account.timezone
}
