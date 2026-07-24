import { randomUUID } from 'node:crypto'
import type { PipelineStage } from 'mongoose'
import {
  DEFAULT_PUBLISH_CLAIM_BATCH_SIZE,
  MAX_PUBLISH_CLAIM_BATCH_SIZE,
  MAX_PAGE_SIZE,
  STALE_PUBLISH_CLAIM_MS,
} from '../config/config.js'
import { PostModel } from '../models/post.model.js'
import {
  PostStatus,
  type ClaimDuePostsOptions,
  type ClaimDuePostsResult,
  type CompletePostPublishInput,
  type CreatePostInput,
  type FailPostPublishInput,
  type GetPostsByAccountFilters,
  type IPost,
  type MarkPostQueuedInput,
  type MarkPostStartedInput,
  type PersistProviderOperationInput,
  type SchedulePostAtomicInput,
  type UpdatePostInput,
  type UpdatePostStatusExtra,
} from '../types/post.types.js'
import { buildFilters, type Pagination } from '../utils/build-filters.js'
import { toObjectId } from '../utils/isValid.js'
import { assertValidTimezone } from '../utils/timezone.js'

const SORT_BY_SCHEDULED = { scheduledAt: 1 } as const
const SORT_BY_CREATED_DESC = { createdAt: -1 } as const

const PUBLISH_METADATA_UNSET = {
  claimToken: '',
  claimedAt: '',
  queuedAt: '',
  startedAt: '',
  lastAttemptAt: '',
  triggerRunId: '',
  triggerBatchId: '',
  providerOperationId: '',
  providerPostId: '',
  providerPermalink: '',
} as const

function buildPostPaginationMeta(
  total: number,
  pagination: Pagination,
  sort: Record<string, 1 | -1>,
) {
  const totalPages = total === 0 ? 0 : Math.ceil(total / pagination.limit)
  return {
    total,
    page: pagination.page,
    limit: pagination.limit,
    hasNextPage: pagination.page < totalPages,
    hasPreviousPage: pagination.page > 1,
    sort,
  }
}

function hasStatusFilter(match: Record<string, unknown>): boolean {
  const status = match.status
  if (status === undefined) return false
  if (typeof status === 'string') return true
  return typeof status === 'object' && status !== null && '$in' in status
}

/** Pick a compound index aligned with workspace list/calendar queries. */
function pickPostListHint(
  match: Record<string, unknown>,
  sort: Record<string, 1 | -1>,
): Record<string, 1 | -1> | undefined {
  if (!match.workspace) return undefined

  const primarySortField = Object.keys(sort)[0]
  const usesSchedule =
    match.scheduledAt !== undefined || primarySortField === 'scheduledAt'

  if (hasStatusFilter(match) && usesSchedule) {
    return { workspace: 1, status: 1, scheduledAt: 1 }
  }

  if (usesSchedule) {
    return { workspace: 1, scheduledAt: 1 }
  }

  return { workspace: 1, createdAt: -1 }
}

function clampClaimLimit(limit?: number): number {
  const raw = limit ?? DEFAULT_PUBLISH_CLAIM_BATCH_SIZE
  return Math.min(Math.max(Math.floor(raw), 1), MAX_PUBLISH_CLAIM_BATCH_SIZE)
}

/** Canonical UTC clock from MongoDB — avoids API host clock skew for due checks. */
export const getDatabaseNow = async (): Promise<Date> => {
  const result = await PostModel.db.db?.command({ isMaster: 1 })
  const local = result?.localTime
  if (local instanceof Date && !Number.isNaN(local.getTime())) {
    return local
  }
  return new Date()
}

export const getPostById = async (id: string): Promise<IPost | null> => {
  return PostModel.findById(id).lean()
}

function assertCreatePostInput(input: CreatePostInput) {
  const { account, workspace, createdBy, provider, type, content } = input
  if (!account || !workspace || !createdBy || !provider || !type || !content) {
    throw new Error('account, workspace, createdBy, provider, type and content are required')
  }
}

const USER_ASSIGNABLE_STATUSES = new Set<PostStatus>([
  PostStatus.DRAFT,
  PostStatus.SCHEDULED,
  PostStatus.CANCELED,
])

export const createPost = async (input: CreatePostInput): Promise<IPost> => {
  assertCreatePostInput(input)

  const status = input.status ?? PostStatus.DRAFT
  if (
    status === PostStatus.PUBLISHING ||
    status === PostStatus.PUBLISHED ||
    status === PostStatus.FAILED
  ) {
    throw new Error('Cannot create a post in an internal publish status')
  }

  const post = await PostModel.create({
    account: toObjectId(input.account),
    workspace: toObjectId(input.workspace),
    createdBy: toObjectId(input.createdBy),
    provider: input.provider,
    type: input.type,
    content: input.content,
    status,
    timezone: assertValidTimezone(input.timezone),
    caption: input.caption,
    description: input.description,
    scheduledAt: input.scheduledAt,
    publishedAt: input.publishedAt,
    failureReason: input.failureReason,
    scheduleRevision: 0,
    attemptCount: 0,
  })

  return post.toObject()
}

const ASSIGNABLE_FIELDS = ['type', 'content', 'timezone'] as const
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

  if (normalized.status !== undefined) {
    if (!USER_ASSIGNABLE_STATUSES.has(normalized.status)) {
      throw new Error('Cannot assign an internal publish status via update')
    }
    $set.status = normalized.status
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
  return PostModel.findOneAndUpdate(
    {
      _id: toObjectId(id),
      status: { $nin: [PostStatus.PUBLISHING, PostStatus.PUBLISHED] },
    },
    updateQuery,
    { new: true },
  ).lean()
}

export const deletePost = async (id: string): Promise<boolean> => {
  const deleted = await PostModel.findOneAndDelete({
    _id: toObjectId(id),
    status: { $ne: PostStatus.PUBLISHING },
  })
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
    .limit(MAX_PAGE_SIZE)
    .lean()
}

/**
 * Paginated post list from a query string / filter object.
 * Example: `?workspace=<id>&page=1&limit=20&status=scheduled`
 */
export const getAllPosts = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const hint = pickPostListHint(match, sort)

  const pipeline: PipelineStage[] = [
    { $match: match },
    {
      $facet: {
        posts: [{ $sort: sort }, { $skip: pagination.skip }, { $limit: pagination.limit }],
        metaCount: [{ $count: 'total' }],
      },
    },
  ]

  const aggregate = PostModel.aggregate(pipeline)
  if (hint) aggregate.hint(hint)

  const [result] = await aggregate.exec()
  const total = (result?.metaCount?.[0] as { total: number } | undefined)?.total ?? 0

  return {
    posts: (result?.posts ?? []) as IPost[],
    meta: buildPostPaginationMeta(total, pagination, sort),
  }
}

/**
 * Posts ready for the publish worker: scheduled and due at or before `now`.
 * Prefer `claimDuePosts` for production dispatch — this is a read-only peek.
 */
export const getDuePosts = async (now: Date, limit = 100): Promise<IPost[]> => {
  return PostModel.find({
    status: PostStatus.SCHEDULED,
    scheduledAt: { $lte: now, $type: 'date' },
  })
    .sort(SORT_BY_SCHEDULED)
    .limit(clampClaimLimit(limit))
    .lean()
}

/**
 * Atomically claim a bounded batch of due posts for this cron tick.
 * Overlapping callers cannot own the same post because only `scheduled` rows match.
 */
export const claimDuePosts = async (
  options: ClaimDuePostsOptions,
): Promise<ClaimDuePostsResult> => {
  const now = options.now ?? (await getDatabaseNow())
  const limit = clampClaimLimit(options.limit)
  const claimToken = options.claimToken || randomUUID()

  const dueIds = await PostModel.find({
    status: PostStatus.SCHEDULED,
    scheduledAt: { $lte: now, $type: 'date' },
  })
    .sort(SORT_BY_SCHEDULED)
    .limit(limit)
    .select({ _id: 1 })
    .lean()

  if (dueIds.length === 0) {
    return { now, claimToken, posts: [] }
  }

  const ids = dueIds.map(doc => doc._id)

  await PostModel.updateMany(
    {
      _id: { $in: ids },
      status: PostStatus.SCHEDULED,
      scheduledAt: { $lte: now, $type: 'date' },
    },
    {
      $set: {
        status: PostStatus.PUBLISHING,
        claimToken,
        claimedAt: now,
      },
      $unset: {
        failureReason: '',
        queuedAt: '',
        startedAt: '',
        triggerRunId: '',
        triggerBatchId: '',
        providerOperationId: '',
        providerPostId: '',
        providerPermalink: '',
      },
    },
  )

  const posts = await PostModel.find({
    _id: { $in: ids },
    status: PostStatus.PUBLISHING,
    claimToken,
  })
    .sort(SORT_BY_SCHEDULED)
    .lean()

  return { now, claimToken, posts }
}

/**
 * Reclaim publishing posts that never started (enqueue crash / Trigger accept then API crash).
 * Safe to redispatch with the same scheduleRevision + idempotency key.
 */
export const reclaimStalePublishingPosts = async (
  options: { now?: Date; olderThanMs?: number; limit?: number; claimToken: string },
): Promise<ClaimDuePostsResult> => {
  const now = options.now ?? (await getDatabaseNow())
  const olderThanMs = options.olderThanMs ?? STALE_PUBLISH_CLAIM_MS
  const limit = clampClaimLimit(options.limit)
  const claimToken = options.claimToken || randomUUID()
  const cutoff = new Date(now.getTime() - olderThanMs)

  const staleIds = await PostModel.find({
    status: PostStatus.PUBLISHING,
    startedAt: { $exists: false },
    claimedAt: { $lte: cutoff, $type: 'date' },
  })
    .sort({ claimedAt: 1 })
    .limit(limit)
    .select({ _id: 1 })
    .lean()

  if (staleIds.length === 0) {
    return { now, claimToken, posts: [] }
  }

  const ids = staleIds.map(doc => doc._id)

  await PostModel.updateMany(
    {
      _id: { $in: ids },
      status: PostStatus.PUBLISHING,
      startedAt: { $exists: false },
      claimedAt: { $lte: cutoff },
    },
    {
      $set: {
        claimToken,
        claimedAt: now,
      },
      $unset: {
        queuedAt: '',
        triggerRunId: '',
        triggerBatchId: '',
      },
    },
  )

  const posts = await PostModel.find({
    _id: { $in: ids },
    status: PostStatus.PUBLISHING,
    claimToken,
  })
    .sort({ claimedAt: 1 })
    .lean()

  return { now, claimToken, posts }
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
 * Prefer `claimDuePosts` for cron dispatch; keep this for single-post / publish-now paths.
 */
export const claimPost = async (
  id: string,
  fromStatus: PostStatus = PostStatus.SCHEDULED,
  claimToken: string = randomUUID(),
): Promise<IPost | null> => {
  const now = await getDatabaseNow()
  return PostModel.findOneAndUpdate(
    { _id: toObjectId(id), status: fromStatus },
    {
      $set: {
        status: PostStatus.PUBLISHING,
        claimToken,
        claimedAt: now,
      },
      $unset: {
        failureReason: '',
        queuedAt: '',
        startedAt: '',
        triggerRunId: '',
        triggerBatchId: '',
        providerOperationId: '',
        providerPostId: '',
        providerPermalink: '',
      },
    },
    { new: true },
  ).lean()
}

/** Release a claimed post back to SCHEDULED when enqueue fails before the task starts. */
export const releasePostClaim = async (
  id: string,
  options: { claimToken?: string; scheduleRevision?: number } = {},
): Promise<IPost | null> => {
  const filter: Record<string, unknown> = {
    _id: toObjectId(id),
    status: PostStatus.PUBLISHING,
    startedAt: { $exists: false },
  }
  if (options.claimToken) filter.claimToken = options.claimToken
  if (options.scheduleRevision !== undefined) {
    filter.scheduleRevision = options.scheduleRevision
  }

  return PostModel.findOneAndUpdate(
    filter,
    {
      $set: { status: PostStatus.SCHEDULED },
      $unset: {
        claimToken: '',
        claimedAt: '',
        queuedAt: '',
        triggerRunId: '',
        triggerBatchId: '',
      },
    },
    { new: true },
  ).lean()
}

/** Atomic schedule transition — bumps revision and clears prior publish metadata. */
export const schedulePostAtomic = async (
  id: string,
  input: SchedulePostAtomicInput,
): Promise<IPost | null> => {
  const timezone = assertValidTimezone(input.timezone)
  return PostModel.findOneAndUpdate(
    {
      _id: toObjectId(id),
      status: {
        $in: [PostStatus.DRAFT, PostStatus.SCHEDULED, PostStatus.FAILED, PostStatus.CANCELED],
      },
    },
    {
      $set: {
        status: PostStatus.SCHEDULED,
        scheduledAt: input.scheduledAt,
        timezone,
      },
      $inc: { scheduleRevision: 1 },
      $unset: {
        ...PUBLISH_METADATA_UNSET,
        failureReason: '',
        publishedAt: '',
      },
    },
    { new: true },
  ).lean()
}

/** Atomic cancel — only when not currently publishing or already published. */
export const cancelPostAtomic = async (id: string): Promise<IPost | null> => {
  return PostModel.findOneAndUpdate(
    {
      _id: toObjectId(id),
      status: {
        $in: [PostStatus.DRAFT, PostStatus.SCHEDULED, PostStatus.FAILED, PostStatus.CANCELED],
      },
    },
    {
      $set: { status: PostStatus.CANCELED },
      $unset: {
        scheduledAt: '',
        failureReason: '',
        ...PUBLISH_METADATA_UNSET,
      },
    },
    { new: true },
  ).lean()
}

export const markPostQueued = async (input: MarkPostQueuedInput): Promise<IPost | null> => {
  const $set: Record<string, unknown> = {
    queuedAt: new Date(),
  }
  if (input.triggerRunId) $set.triggerRunId = input.triggerRunId
  if (input.triggerBatchId) $set.triggerBatchId = input.triggerBatchId

  return PostModel.findOneAndUpdate(
    {
      _id: toObjectId(input.postId),
      status: PostStatus.PUBLISHING,
      scheduleRevision: input.scheduleRevision,
      claimToken: input.claimToken,
      startedAt: { $exists: false },
    },
    { $set },
    { new: true },
  ).lean()
}

export const markPostStarted = async (input: MarkPostStartedInput): Promise<IPost | null> => {
  const now = new Date()
  const $set: Record<string, unknown> = {
    startedAt: now,
    lastAttemptAt: now,
  }
  if (input.triggerRunId) $set.triggerRunId = input.triggerRunId

  return PostModel.findOneAndUpdate(
    {
      _id: toObjectId(input.postId),
      status: PostStatus.PUBLISHING,
      scheduleRevision: input.scheduleRevision,
      claimToken: input.claimToken,
    },
    {
      $set,
      $inc: { attemptCount: 1 },
    },
    { new: true },
  ).lean()
}

export const persistProviderOperation = async (
  input: PersistProviderOperationInput,
): Promise<IPost | null> => {
  return PostModel.findOneAndUpdate(
    {
      _id: toObjectId(input.postId),
      status: PostStatus.PUBLISHING,
      scheduleRevision: input.scheduleRevision,
      claimToken: input.claimToken,
    },
    { $set: { providerOperationId: input.providerOperationId } },
    { new: true },
  ).lean()
}

export const completePostPublish = async (
  input: CompletePostPublishInput,
): Promise<IPost | null> => {
  const $set: Record<string, unknown> = {
    status: PostStatus.PUBLISHED,
    publishedAt: input.publishedAt ?? new Date(),
  }
  if (input.providerPostId) $set.providerPostId = input.providerPostId
  if (input.providerPermalink) $set.providerPermalink = input.providerPermalink
  if (input.providerOperationId) $set.providerOperationId = input.providerOperationId

  return PostModel.findOneAndUpdate(
    {
      _id: toObjectId(input.postId),
      status: PostStatus.PUBLISHING,
      scheduleRevision: input.scheduleRevision,
      claimToken: input.claimToken,
    },
    {
      $set,
      $unset: {
        failureReason: '',
        claimToken: '',
        claimedAt: '',
        queuedAt: '',
        startedAt: '',
      },
    },
    { new: true },
  ).lean()
}

export const failPostPublish = async (input: FailPostPublishInput): Promise<IPost | null> => {
  const $set: Record<string, unknown> = {
    status: PostStatus.FAILED,
    failureReason: input.failureReason,
  }
  if (input.providerOperationId) $set.providerOperationId = input.providerOperationId

  return PostModel.findOneAndUpdate(
    {
      _id: toObjectId(input.postId),
      status: PostStatus.PUBLISHING,
      scheduleRevision: input.scheduleRevision,
      claimToken: input.claimToken,
    },
    {
      $set,
      $unset: {
        claimToken: '',
        claimedAt: '',
        queuedAt: '',
        startedAt: '',
      },
    },
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
