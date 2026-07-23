import { PostModel } from '../models/post.model.js'
import {
  PostStatus,
  type CreatePostInput,
  type GetPostsByAccountFilters,
  type IPost,
  type UpdatePostInput,
  type UpdatePostStatusExtra,
} from '../types/post.types.js'
import { buildFilters } from '../utils/build-filters.js'
import { toObjectId } from '../utils/isValid.js'
import { assertValidTimezone } from '../utils/timezone.js'

const SORT_BY_SCHEDULED = { scheduledAt: 1 } as const
const SORT_BY_CREATED_DESC = { createdAt: -1 } as const

export const getPostById = async (id: string): Promise<IPost | null> => {
  return PostModel.findById(id).lean()
}

function assertCreatePostInput(input: CreatePostInput) {
  const { account, workspace, createdBy, provider, type, content } = input
  if (!account || !workspace || !createdBy || !provider || !type || !content) {
    throw new Error('account, workspace, createdBy, provider, type and content are required')
  }
}

export const createPost = async (input: CreatePostInput): Promise<IPost> => {
  assertCreatePostInput(input)

  const post = await PostModel.create({
    account: toObjectId(input.account),
    workspace: toObjectId(input.workspace),
    createdBy: toObjectId(input.createdBy),
    provider: input.provider,
    type: input.type,
    content: input.content,
    status: input.status ?? PostStatus.DRAFT,
    timezone: assertValidTimezone(input.timezone),
    caption: input.caption,
    description: input.description,
    scheduledAt: input.scheduledAt,
    publishedAt: input.publishedAt,
    failureReason: input.failureReason,
  })

  return post.toObject()
}

const ASSIGNABLE_FIELDS = ['type', 'content', 'status', 'timezone'] as const
const NULLABLE_FIELDS = ['caption', 'description', 'scheduledAt', 'publishedAt', 'failureReason'] as const

function buildUpdateQuery(updates: UpdatePostInput): Record<string, unknown> {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, ''> = {}

  const normalized: UpdatePostInput = { ...updates }
  if (normalized.timezone !== undefined) {
    normalized.timezone = assertValidTimezone(normalized.timezone)
  }

  for (const key of ASSIGNABLE_FIELDS) {
    const value = normalized[key]
    if (value !== undefined) $set[key] = value
  }

  for (const key of NULLABLE_FIELDS) {
    const value = normalized[key]
    if (value === undefined) continue
    if (value === null) $unset[key] = ''
    else $set[key] = value
  }

  const query: Record<string, unknown> = {}
  if (Object.keys($set).length > 0) query.$set = $set
  if (Object.keys($unset).length > 0) query.$unset = $unset
  return query
}

export const updatePost = async (id: string, updates: UpdatePostInput): Promise<IPost | null> => {
  const updateQuery = buildUpdateQuery(updates)
  if (Object.keys(updateQuery).length === 0) return getPostById(id)
  return PostModel.findByIdAndUpdate(id, updateQuery, { new: true }).lean()
}

export const deletePost = async (id: string): Promise<boolean> => {
  const deleted = await PostModel.findByIdAndDelete(id)
  return Boolean(deleted)
}

export const getPostsByAccount = async (
  accountId: string,
  filters: GetPostsByAccountFilters = {},
): Promise<IPost[]> => {
  const match: Record<string, unknown> = { account: toObjectId(accountId) }

  if (filters.type !== undefined) match.type = filters.type
  if (filters.status !== undefined) match.status = filters.status

  const hasScheduleRange = filters.from !== undefined || filters.to !== undefined
  if (hasScheduleRange) {
    const scheduledAt: Record<string, Date> = {}
    if (filters.from !== undefined) scheduledAt.$gte = filters.from
    if (filters.to !== undefined) scheduledAt.$lte = filters.to
    match.scheduledAt = scheduledAt
  }

  return PostModel.find(match)
    .sort(hasScheduleRange ? SORT_BY_SCHEDULED : SORT_BY_CREATED_DESC)
    .lean()
}

/**
 * Paginated post list from a query string / filter object.
 * Example: `?workspace=<id>&page=1&limit=20&status=scheduled`
 */
export const getAllPosts = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const [posts, total] = await Promise.all([
    PostModel.find(match).sort(sort).limit(pagination.limit).skip(pagination.skip).lean(),
    PostModel.countDocuments(match),
  ])
  return {
    posts,
    meta: {
      total,
      page: pagination.page,
      limit: pagination.limit,
      hasNextPage: pagination.page < Math.ceil(total / pagination.limit),
      hasPreviousPage: pagination.page > 1,
      sort,
    },
  }
}

/**
 * Posts ready for the publish worker: scheduled and due at or before `now`.
 * Use `claimPost` to atomically transition each result to PUBLISHING and avoid double-publishing.
 */
export const getDuePosts = async (now: Date, limit = 100): Promise<IPost[]> => {
  return PostModel.find({
    status: PostStatus.SCHEDULED,
    scheduledAt: { $lte: now },
  })
    .sort(SORT_BY_SCHEDULED)
    .limit(limit)
    .lean()
}

export const updatePostStatus = async (
  id: string,
  status: PostStatus,
  extra: UpdatePostStatusExtra = {},
): Promise<IPost | null> => {
  const $set: Record<string, unknown> = { status }
  const $unset: Record<string, ''> = {}

  if (extra.publishedAt !== undefined) {
    if (extra.publishedAt === null) $unset.publishedAt = ''
    else $set.publishedAt = extra.publishedAt
  }

  if (extra.failureReason !== undefined) {
    if (extra.failureReason === null) $unset.failureReason = ''
    else $set.failureReason = extra.failureReason
  } else if (status === PostStatus.PUBLISHED || status === PostStatus.PUBLISHING) {
    $unset.failureReason = ''
  }

  const updateQuery: Record<string, unknown> = { $set }
  if (Object.keys($unset).length > 0) updateQuery.$unset = $unset

  return PostModel.findByIdAndUpdate(id, updateQuery, { new: true }).lean()
}

/**
 * Atomically claim a post for publishing — only succeeds if the current status matches `fromStatus`.
 * Returns the claimed post, or null if another worker already claimed it (or it no longer exists).
 * Use this instead of `getDuePosts` + `updatePostStatus` to prevent double-publishing under concurrent workers.
 */
export const claimPost = async (
  id: string,
  fromStatus: PostStatus = PostStatus.SCHEDULED,
): Promise<IPost | null> => {
  return PostModel.findOneAndUpdate(
    { _id: toObjectId(id), status: fromStatus },
    { $set: { status: PostStatus.PUBLISHING }, $unset: { failureReason: '' } },
    { new: true },
  ).lean()
}

/** Release a claimed post back to SCHEDULED when publishing is interrupted before sending. */
export const releasePostClaim = async (id: string): Promise<IPost | null> => {
  return PostModel.findByIdAndUpdate(
    id,
    { $set: { status: PostStatus.SCHEDULED } },
    { new: true },
  ).lean()
}

/** Next upcoming scheduled post for an account (earliest `scheduledAt` at or after `now`). */
export const getNextScheduledPost = async (
  accountId: string,
  now: Date = new Date(),
): Promise<IPost | null> => {
  return PostModel.findOne({
    account: toObjectId(accountId),
    status: PostStatus.SCHEDULED,
    scheduledAt: { $gte: now },
  })
    .sort(SORT_BY_SCHEDULED)
    .lean()
}

/** Count of posts per status for a workspace — used by dashboard stats. */
export const countPostsByStatus = async (
  workspaceId: string,
): Promise<Record<PostStatus, number>> => {
  const counts = await PostModel.aggregate<{
    _id: PostStatus
    count: number
  }>([
    { $match: { workspace: toObjectId(workspaceId) } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ])

  const result = {} as Record<PostStatus, number>
  for (const c of counts) result[c._id] = c.count
  return result
}
