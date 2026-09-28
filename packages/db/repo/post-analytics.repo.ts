import {
  DEFAULT_POST_ANALYTICS_CLAIM_BATCH_SIZE,
  MAX_POST_ANALYTICS_CLAIM_BATCH_SIZE,
  POST_ANALYTICS_LEASE_MS,
} from '../config/config.js'
import { AccountModel } from '../models/account.model.js'
import { PostAnalyticsSnapshotModel } from '../models/post-analytics-snapshot.model.js'
import { PostModel } from '../models/post.model.js'
import {
  AccountAnalyticsStatus,
  ConnectionStatus,
  type SocialProvider,
} from '../types/account.types.js'
import type {
  InsertPostAnalyticsSnapshotInput,
  PostAnalyticsCheckpoint,
} from '../types/post-analytics.types.js'
import { PostStatus, type IPost } from '../types/post.types.js'
import { isDuplicateKeyError } from '../utils/is-duplicate-key-error.js'
import { toObjectId } from '../utils/isValid.js'
import {
  initialPostAnalyticsSchedule,
  isPostAnalyticsCheckpoint,
  isPostAnalyticsSupportedProvider,
  postAnalyticsOldestPublishedAt,
  resolvePostAnalyticsSchedule,
  type PostAnalyticsScheduleDecision,
} from '../utils/post-analytics-schedule.js'

function clampClaimLimit(limit: number): number {
  return Math.min(Math.max(limit, 1), MAX_POST_ANALYTICS_CLAIM_BATCH_SIZE)
}

function hasProviderPostId(post: Pick<IPost, 'providerPostId'>): boolean {
  return typeof post.providerPostId === 'string' && post.providerPostId.trim().length > 0
}

const UNSCHEDULED_FILTER = {
  'postAnalytics.completedAt': { $exists: false },
  $or: [
    { postAnalytics: { $exists: false } },
    { 'postAnalytics.nextCheckpointKey': { $exists: false } },
  ],
}

function scheduleUpdate(decision: PostAnalyticsScheduleDecision, extra?: {
  consecutiveFailures?: number
  lastError?: string | null
  now?: Date
}): { $set: Record<string, unknown>; $unset: Record<string, ''> } {
  const $unset: Record<string, ''> = {
    'postAnalytics.inFlightCheckpointKey': '',
    'postAnalytics.leasedUntil': '',
  }

  if (decision.kind === 'complete') {
    return {
      $set: {
        'postAnalytics.completedAt': extra?.now ?? new Date(),
        'postAnalytics.consecutiveFailures': 0,
      },
      $unset: {
        ...$unset,
        'postAnalytics.nextCheckpointKey': '',
        'postAnalytics.nextCheckpointAt': '',
        'postAnalytics.lastError': '',
      },
    }
  }

  const $set: Record<string, unknown> = {
    'postAnalytics.nextCheckpointKey': decision.checkpointKey,
    'postAnalytics.nextCheckpointAt':
      decision.kind === 'scheduled' ? decision.nextCheckpointAt : extra?.now ?? new Date(),
    'postAnalytics.consecutiveFailures': extra?.consecutiveFailures ?? 0,
  }

  if (extra?.lastError) {
    $set['postAnalytics.lastError'] = extra.lastError
  } else {
    $unset['postAnalytics.lastError'] = ''
  }

  return { $set, $unset }
}

function expectedCheckpointFilter(postId: string, checkpointKey: PostAnalyticsCheckpoint) {
  return {
    _id: toObjectId(postId),
    $or: [
      { 'postAnalytics.inFlightCheckpointKey': checkpointKey },
      { 'postAnalytics.nextCheckpointKey': checkpointKey },
    ],
  }
}

/** Insert one snapshot per (post, checkpoint). Duplicate key is a successful no-op. */
export const insertPostAnalyticsSnapshot = async (input: InsertPostAnalyticsSnapshotInput) => {
  try {
    const created = await PostAnalyticsSnapshotModel.create({
      workspace: toObjectId(input.workspaceId),
      account: toObjectId(input.accountId),
      post: toObjectId(input.postId),
      provider: input.provider,
      providerPostId: input.providerPostId,
      checkpointKey: input.checkpointKey,
      hoursSincePublish: input.hoursSincePublish,
      publishedAt: input.publishedAt,
      capturedAt: input.capturedAt,
      metrics: input.metrics,
      missingMetrics: input.missingMetrics ?? [],
      raw: input.raw,
    })
    return created.toObject()
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      return PostAnalyticsSnapshotModel.findOne({
        post: toObjectId(input.postId),
        checkpointKey: input.checkpointKey,
      }).lean()
    }
    throw error
  }
}

export const getPostsByIds = async (postIds: string[]): Promise<IPost[]> => {
  if (postIds.length === 0) return []
  return PostModel.find({ _id: { $in: postIds.map(id => toObjectId(id)) } }).lean()
}

export const filterPostAnalyticsEligibleAccountIds = async (
  accountIds: string[],
): Promise<Set<string>> => {
  if (accountIds.length === 0) return new Set()

  const accounts = await AccountModel.find({
    _id: { $in: accountIds.map(id => toObjectId(id)) },
    connectionStatus: ConnectionStatus.CONNECTED,
    $or: [
      { 'analytics.status': { $exists: false } },
      {
        'analytics.status': {
          $nin: [AccountAnalyticsStatus.NEEDS_REAUTH, AccountAnalyticsStatus.UNSUPPORTED],
        },
      },
    ],
  })
    .select({ _id: 1 })
    .lean()

  return new Set(accounts.map(account => account._id.toString()))
}

export type FindDuePostAnalyticsOptions = {
  workspaceIds: string[]
  providers: SocialProvider[]
  now: Date
  limit?: number
}

/** Published posts whose next checkpoint is due and not under an active lease. */
export const findDuePostAnalyticsPosts = async (
  options: FindDuePostAnalyticsOptions,
): Promise<IPost[]> => {
  if (options.workspaceIds.length === 0 || options.providers.length === 0) return []

  const limit = clampClaimLimit(options.limit ?? DEFAULT_POST_ANALYTICS_CLAIM_BATCH_SIZE)
  const oldest = postAnalyticsOldestPublishedAt(options.now)

  return PostModel.find({
    status: PostStatus.PUBLISHED,
    provider: { $in: options.providers },
    providerPostId: { $type: 'string', $ne: '' },
    workspace: { $in: options.workspaceIds.map(id => toObjectId(id)) },
    publishedAt: { $gte: oldest, $type: 'date' },
    'postAnalytics.nextCheckpointAt': { $lte: options.now, $type: 'date' },
    $or: [
      { 'postAnalytics.leasedUntil': { $exists: false } },
      { 'postAnalytics.leasedUntil': { $lte: options.now } },
    ],
  })
    .sort({ 'postAnalytics.nextCheckpointAt': 1, _id: 1 })
    .limit(limit)
    .lean()
}

export const findUnscheduledPostAnalyticsPosts = async (
  options: FindDuePostAnalyticsOptions,
): Promise<IPost[]> => {
  if (options.workspaceIds.length === 0 || options.providers.length === 0) return []

  const limit = clampClaimLimit(options.limit ?? DEFAULT_POST_ANALYTICS_CLAIM_BATCH_SIZE)
  const oldest = postAnalyticsOldestPublishedAt(options.now)

  return PostModel.find({
    status: PostStatus.PUBLISHED,
    provider: { $in: options.providers },
    providerPostId: { $type: 'string', $ne: '' },
    workspace: { $in: options.workspaceIds.map(id => toObjectId(id)) },
    publishedAt: { $gte: oldest, $lte: options.now, $type: 'date' },
    ...UNSCHEDULED_FILTER,
  })
    .sort({ publishedAt: 1, _id: 1 })
    .limit(limit)
    .lean()
}

export const leasePostAnalyticsPosts = async (options: {
  postIds: string[]
  now: Date
  leaseMs?: number
}): Promise<IPost[]> => {
  if (options.postIds.length === 0) return []

  const leaseUntil = new Date(options.now.getTime() + (options.leaseMs ?? POST_ANALYTICS_LEASE_MS))
  const ids = options.postIds.map(id => toObjectId(id))

  await PostModel.updateMany(
    {
      _id: { $in: ids },
      status: PostStatus.PUBLISHED,
      'postAnalytics.nextCheckpointAt': { $lte: options.now },
      $or: [
        { 'postAnalytics.leasedUntil': { $exists: false } },
        { 'postAnalytics.leasedUntil': { $lte: options.now } },
      ],
    },
    [
      {
        $set: {
          'postAnalytics.leasedUntil': leaseUntil,
          'postAnalytics.inFlightCheckpointKey': '$postAnalytics.nextCheckpointKey',
        },
      },
    ],
  )

  return PostModel.find({
    _id: { $in: ids },
    'postAnalytics.leasedUntil': leaseUntil,
    'postAnalytics.inFlightCheckpointKey': { $type: 'string' },
  })
    .sort({ 'postAnalytics.nextCheckpointAt': 1, _id: 1 })
    .lean()
}

export const clearPostAnalyticsLease = async (postIds: string[]): Promise<void> => {
  if (postIds.length === 0) return
  await PostModel.updateMany(
    { _id: { $in: postIds.map(id => toObjectId(id)) } },
    {
      $unset: {
        'postAnalytics.inFlightCheckpointKey': '',
        'postAnalytics.leasedUntil': '',
      },
    },
  )
}

/** Push due time forward without changing the checkpoint (ineligible account, etc.). */
export const deferPostAnalyticsPosts = async (
  postIds: string[],
  nextCheckpointAt: Date,
): Promise<void> => {
  if (postIds.length === 0) return
  await PostModel.updateMany(
    { _id: { $in: postIds.map(id => toObjectId(id)) } },
    {
      $set: { 'postAnalytics.nextCheckpointAt': nextCheckpointAt },
      $unset: {
        'postAnalytics.inFlightCheckpointKey': '',
        'postAnalytics.leasedUntil': '',
      },
    },
  )
}

export const applyPostAnalyticsSchedule = async (options: {
  postId: string
  expectedCheckpointKey: PostAnalyticsCheckpoint
  decision: PostAnalyticsScheduleDecision
  now: Date
  consecutiveFailures?: number
  lastError?: string | null
}): Promise<void> => {
  const update = scheduleUpdate(options.decision, {
    consecutiveFailures: options.consecutiveFailures,
    lastError: options.lastError,
    now: options.now,
  })
  await PostModel.updateOne(
    expectedCheckpointFilter(options.postId, options.expectedCheckpointKey),
    update,
  )
}

export const bulkAdvanceMissedPostAnalytics = async (
  posts: IPost[],
  now: Date,
): Promise<number> => {
  const ops: Array<{
    updateOne: {
      filter: Record<string, unknown>
      update: { $set: Record<string, unknown>; $unset: Record<string, ''> }
    }
  }> = []

  for (const post of posts) {
    const checkpointKey = post.postAnalytics?.nextCheckpointKey
    if (!post.publishedAt) {
      ops.push({
        updateOne: {
          filter: { _id: post._id },
          update: scheduleUpdate({ kind: 'complete' }, { now }),
        },
      })
      continue
    }
    if (!isPostAnalyticsCheckpoint(checkpointKey)) {
      ops.push({
        updateOne: {
          filter: { _id: post._id },
          update: scheduleUpdate(initialPostAnalyticsSchedule(post.publishedAt, now), { now }),
        },
      })
      continue
    }

    const decision = resolvePostAnalyticsSchedule(post.publishedAt, checkpointKey, now)
    if (decision.kind === 'fetch') continue

    ops.push({
      updateOne: {
        filter: expectedCheckpointFilter(post._id.toString(), checkpointKey),
        update: scheduleUpdate(decision, { now }),
      },
    })
  }

  if (ops.length === 0) return 0
  const result = await PostModel.bulkWrite(ops, { ordered: false })
  return result.modifiedCount
}

export const initializePostAnalyticsSchedules = async (
  posts: IPost[],
  now: Date,
): Promise<number> => {
  const ops: Array<{
    updateOne: {
      filter: Record<string, unknown>
      update: { $set: Record<string, unknown>; $unset?: Record<string, ''> }
    }
  }> = []

  for (const post of posts) {
    if (!post.publishedAt || !hasProviderPostId(post)) continue
    const decision = initialPostAnalyticsSchedule(post.publishedAt, now)
    const update = scheduleUpdate(decision, { now })
    ops.push({
      updateOne: {
        filter: {
          _id: post._id,
          ...UNSCHEDULED_FILTER,
        },
        update,
      },
    })
  }

  if (ops.length === 0) return 0
  const result = await PostModel.bulkWrite(ops, { ordered: false })
  return result.modifiedCount
}

/** Seed the 1h→30d schedule after a successful IG/FB publish. Idempotent. */
export const seedPostAnalyticsIfEligible = async (
  post: IPost,
  now: Date = new Date(),
): Promise<IPost> => {
  if (!isPostAnalyticsSupportedProvider(post.provider)) return post
  if (!hasProviderPostId(post) || !post.publishedAt) return post
  if (post.postAnalytics?.nextCheckpointKey || post.postAnalytics?.completedAt) return post

  const decision = initialPostAnalyticsSchedule(post.publishedAt, now)
  const update = scheduleUpdate(decision, { now })
  const updated = await PostModel.findOneAndUpdate(
    {
      _id: post._id,
      ...UNSCHEDULED_FILTER,
    },
    update,
    { returnDocument: 'after' },
  ).lean()

  return updated ?? post
}
