import type { AppContext } from '@/middlewares/auth.middleware.js'
import { withQueryParam, parseParamId } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { getAccountOrThrow, getAccountForMember } from '@/utils/account.utils.js'
import {
  assertProviderSupportsPostType,
  getPostForMember,
  parseCreatePostInput,
  parseSchedulePostInput,
  parseUpdatePostInput,
  resolvePostTimezone,
  serializePost,
  toCreatePostInput,
  toUpdatePostInput,
} from '@/utils/post.utils.js'
import { buildPublishPostTriggerItem } from '@/utils/publish-dispatch.utils.js'
import { assertPostsLimit, getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  PostStatus,
  SocialProvider,
  cancelPostAtomic,
  claimPostForImmediatePublish,
  countPostsByStatus,
  createPost as createPostInDb,
  decrementPostsUsage,
  deletePost as deletePostInDb,
  failPostPublish,
  getAllPosts,
  getPostsByAccount,
  getPublishedPostsByDay,
  incrementPostsUsage,
  markPostQueued,
  schedulePostAtomic,
  updatePost as updatePostInDb,
  type IPost,
} from '@socialista/db'
import { TASK_IDS, type PublishedPostActivityResponse } from '@socialista/types'
import type { PublishPostTask } from '@socialista/trigger/task-types'
import { tasks } from '@trigger.dev/sdk/v3'
import { randomUUID } from 'node:crypto'
import type { Context } from 'hono'

export const createPost = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const input = parseCreatePostInput((await c.req.json()) as Record<string, unknown>)

  const [workspace, account] = await Promise.all([
    getWorkspaceAsMember(input.workspaceId, userId),
    getAccountOrThrow(input.accountId),
  ])
  if (account.workspace.toString() !== input.workspaceId) {
    throw new HttpError(400, 'Account does not belong to this workspace')
  }
  if (account.provider !== input.provider) {
    throw new HttpError(400, 'Provider does not match the selected account')
  }
  assertProviderSupportsPostType(account.provider, input.type)
  assertPostsLimit(workspace)

  const timezone = await resolvePostTimezone(input.timezone, input.accountId)
  const post = await createPostInDb(toCreatePostInput(input, userId, timezone))
  await incrementPostsUsage(input.workspaceId)

  return successResponse(c, 201, { post: serializePost(post) })
}

export const getWorkspacePosts = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const data = await getAllPosts(withQueryParam(c.req.url, 'workspace', workspaceId))
  return successResponse(
    c,
    200,
    { posts: data.posts.map(post => serializePost(post as IPost)) },
    data.meta,
  )
}

export const getAccountPosts = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const accountId = parseParamId(c.req.param('accountId'), 'account ID')
  await getAccountForMember(accountId, userId)

  const query = c.req.query()
  const posts = await getPostsByAccount(accountId, {
    type: query.type as IPost['type'] | undefined,
    status: query.status as PostStatus | undefined,
    from: query.from ? new Date(query.from) : undefined,
    to: query.to ? new Date(query.to) : undefined,
  })

  return successResponse(c, 200, { posts: posts.map(serializePost) })
}

export const getPost = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'post ID')
  const post = await getPostForMember(id, userId)
  return successResponse(c, 200, { post: serializePost(post) })
}

export const updatePost = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'post ID')
  const input = parseUpdatePostInput((await c.req.json()) as Record<string, unknown>)
  const existing = await getPostForMember(id, userId)

  if (existing.status === PostStatus.PUBLISHING) {
    throw new HttpError(409, 'Post is currently publishing')
  }
  if (existing.status === PostStatus.PUBLISHED) {
    throw new HttpError(400, 'Published posts cannot be modified this way')
  }

  if (input.type) {
    assertProviderSupportsPostType(existing.provider, input.type)
  }

  const post = await updatePostInDb(id, toUpdatePostInput(input))
  if (!post) throw new HttpError(404, 'Post not found')

  return successResponse(c, 200, { post: serializePost(post) })
}

export const deletePost = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'post ID')
  const post = await getPostForMember(id, userId)

  if (post.status === PostStatus.PUBLISHING) {
    throw new HttpError(409, 'Post is currently publishing')
  }

  const deleted = await deletePostInDb(id)
  if (!deleted) throw new HttpError(404, 'Post not found')

  // Release the workspace post slot back when removing a non-draft post.
  if (post.status !== PostStatus.DRAFT) {
    void decrementPostsUsage(post.workspace.toString())
  }

  return successResponse(c, 200, { id, workspaceId: post.workspace.toString() })
}

export const schedulePost = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'post ID')
  const input = parseSchedulePostInput((await c.req.json()) as Record<string, unknown>)

  const post = await getPostForMember(id, userId)
  assertPostNotPublishing(post)
  assertProviderSupportsPostType(post.provider, post.type)

  const timezone = input.timezone ?? post.timezone
  const updated = await schedulePostAtomic(id, {
    scheduledAt: input.scheduledAt instanceof Date ? input.scheduledAt : new Date(input.scheduledAt),
    timezone,
  })
  if (!updated) {
    throw new HttpError(409, 'Post cannot be scheduled in its current state')
  }

  return successResponse(c, 200, { post: serializePost(updated) })
}

export const cancelPost = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'post ID')
  const post = await getPostForMember(id, userId)

  if (post.status === PostStatus.PUBLISHED) {
    throw new HttpError(400, 'Published posts cannot be canceled')
  }
  assertPostNotPublishing(post)
  if (post.status === PostStatus.CANCELED) {
    return successResponse(c, 200, { post: serializePost(post) })
  }

  const updated = await cancelPostAtomic(id)
  if (!updated) {
    throw new HttpError(409, 'Post cannot be canceled in its current state')
  }

  return successResponse(c, 200, { post: serializePost(updated) })
}

/**
 * Immediately claim a post and dispatch the Trigger.dev publish task.
 * On Trigger enqueue failure the post is marked failed (not returned to scheduled).
 */
export const publishPostNow = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'post ID')
  const post = await getPostForMember(id, userId)

  assertPostNotPublishing(post)
  assertProviderSupportsPostType(post.provider, post.type)

  const claimToken = randomUUID()
  const claimed = await claimPostForImmediatePublish(id, claimToken)
  if (!claimed) {
    throw new HttpError(409, 'Post cannot be published in its current state')
  }

  const { payload, options } = buildPublishPostTriggerItem(claimed, claimToken)
  const scheduleRevision = claimed.scheduleRevision ?? 0

  try {
    const handle = await tasks.trigger<PublishPostTask>(TASK_IDS.publishPost, payload, options)
    const queued = await markPostQueued({
      postId: id,
      scheduleRevision,
      claimToken,
      triggerRunId: handle.id,
    })

    return successResponse(c, 202, {
      post: serializePost(queued ?? claimed),
      runId: handle.id,
    })
  } catch (error) {
    const failureReason =
      error instanceof Error ? error.message : 'Failed to queue publish job'
    console.error('publishPostNow trigger failed', {
      postId: id,
      scheduleRevision,
      message: failureReason,
    })
    await failPostPublish({
      postId: id,
      scheduleRevision,
      claimToken,
      failureReason: 'Failed to queue publish job. Try again shortly.',
    })
    throw new HttpError(502, 'Failed to queue publish job. Try again shortly.')
  }
}

export const getWorkspacePostStats = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const stats = await countPostsByStatus(workspaceId)
  return successResponse(c, 200, { stats })
}

const ACTIVITY_PROVIDERS = new Set<string>(Object.values(SocialProvider))
const DEFAULT_ACTIVITY_DAYS = 365
const MAX_ACTIVITY_DAYS = 366

function parseActivityDays(raw: string | undefined): number {
  if (!raw) return DEFAULT_ACTIVITY_DAYS
  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new HttpError(400, 'days must be a positive integer')
  }
  return Math.min(parsed, MAX_ACTIVITY_DAYS)
}

function parseActivityProvider(raw: string | undefined): SocialProvider | undefined {
  if (!raw) return undefined
  if (!ACTIVITY_PROVIDERS.has(raw)) {
    throw new HttpError(400, 'Invalid provider')
  }
  return raw as SocialProvider
}

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

function toIsoDay(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** Daily published-post counts for the publishing activity heatmap. */
export const getWorkspacePublishedActivity = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const days = parseActivityDays(c.req.query('days'))
  const provider = parseActivityProvider(c.req.query('provider'))

  const end = startOfUtcDay(new Date())
  end.setUTCDate(end.getUTCDate() + 1) // exclusive end = tomorrow 00:00 UTC
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - days)

  const activity = await getPublishedPostsByDay({
    workspaceId,
    start,
    end,
    provider,
  })

  const total = activity.reduce((sum, day) => sum + day.count, 0)
  const inclusiveEnd = new Date(end)
  inclusiveEnd.setUTCDate(inclusiveEnd.getUTCDate() - 1)

  const response: PublishedPostActivityResponse = {
    days,
    start: toIsoDay(start),
    end: toIsoDay(inclusiveEnd),
    total,
    activity,
  }

  return successResponse(c, 200, response)
}

function assertPostNotPublishing(post: IPost) {
  if (post.status === PostStatus.PUBLISHED) {
    throw new HttpError(400, 'Published posts cannot be modified this way')
  }
  if (post.status === PostStatus.PUBLISHING) {
    throw new HttpError(409, 'Post is currently publishing')
  }
}
