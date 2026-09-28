import {
  bulkAdvanceMissedPostAnalytics,
  connectDb,
  DEFAULT_POST_ANALYTICS_CLAIM_BATCH_SIZE,
  deferPostAnalyticsPosts,
  disconnectDb,
  filterPostAnalyticsEligibleAccountIds,
  findDuePostAnalyticsPosts,
  findUnscheduledPostAnalyticsPosts,
  initializePostAnalyticsSchedules,
  isPostAnalyticsCheckpoint,
  leasePostAnalyticsPosts,
  listPremiumWorkspaceIds,
  MAX_POST_ANALYTICS_CLAIM_PER_TICK,
  POST_ANALYTICS_POSTS_PER_TASK,
  POST_ANALYTICS_PROVIDERS,
  POST_ANALYTICS_RETRY_DELAY_MS,
  resolvePostAnalyticsSchedule,
  type IPost,
  type PostAnalyticsCheckpoint,
} from '@socialista/db'
import { TASK_IDS } from '@socialista/types'
import { logger, schemaTask, tasks } from '@trigger.dev/sdk/v3'

import { postAnalyticsSweepPayloadSchema } from '../../schemas/post-analytics-sweep.schema.js'
import type { FetchPostAnalyticsTask } from './fetch-post-analytics.js'

const WORKSPACE_PAGE = 500
/** Trigger.dev batchTrigger max is 1000 (SDK 4.3.1+); keep a safe mini-batch size. */
const BATCH_SIZE = 100

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

function utcHourKey(date: Date): string {
  return date.toISOString().slice(0, 13)
}

function uniqueAccountIds(posts: IPost[]): string[] {
  return [...new Set(posts.map(post => post.account.toString()))]
}

function filterEligiblePosts(posts: IPost[], eligibleAccounts: Set<string>): IPost[] {
  return posts.filter(post => eligibleAccounts.has(post.account.toString()))
}

function partitionDuePosts(
  posts: IPost[],
  now: Date,
): { toFetch: IPost[]; toAdvance: IPost[] } {
  const toFetch: IPost[] = []
  const toAdvance: IPost[] = []

  for (const post of posts) {
    const checkpointKey = post.postAnalytics?.nextCheckpointKey
    if (!post.publishedAt || !isPostAnalyticsCheckpoint(checkpointKey)) {
      toAdvance.push(post)
      continue
    }
    const decision = resolvePostAnalyticsSchedule(post.publishedAt, checkpointKey, now)
    if (decision.kind === 'fetch') toFetch.push(post)
    else toAdvance.push(post)
  }

  return { toFetch, toAdvance }
}

function groupByAccountCheckpoint(posts: IPost[]): Map<string, IPost[]> {
  const groups = new Map<string, IPost[]>()
  for (const post of posts) {
    const checkpointKey =
      post.postAnalytics?.inFlightCheckpointKey ?? post.postAnalytics?.nextCheckpointKey
    if (!isPostAnalyticsCheckpoint(checkpointKey) || !post.providerPostId) continue
    const key = `${post.account.toString()}:${checkpointKey}`
    const list = groups.get(key)
    if (list) list.push(post)
    else groups.set(key, [post])
  }
  return groups
}

async function enqueueLeasedPosts(
  leasedPosts: IPost[],
  hourKey: string,
): Promise<{ enqueued: number; batchCount: number }> {
  const groups = groupByAccountCheckpoint(leasedPosts)
  const items: Array<{
    payload: {
      accountId: string
      checkpointKey: PostAnalyticsCheckpoint
      posts: Array<{ postId: string; providerPostId: string }>
    }
    options: { idempotencyKey: string; concurrencyKey: string }
  }> = []

  for (const groupPosts of groups.values()) {
    const first = groupPosts[0]
    if (!first) continue
    const checkpointKey =
      first.postAnalytics?.inFlightCheckpointKey ?? first.postAnalytics?.nextCheckpointKey
    if (!isPostAnalyticsCheckpoint(checkpointKey)) continue
    const accountId = first.account.toString()

    for (const chunk of chunkArray(groupPosts, POST_ANALYTICS_POSTS_PER_TASK)) {
      const firstPostId = [...chunk.map(post => post._id.toString())].sort()[0]
      if (!firstPostId) continue
      items.push({
        payload: {
          accountId,
          checkpointKey,
          posts: chunk.flatMap(post =>
            post.providerPostId
              ? [{ postId: post._id.toString(), providerPostId: post.providerPostId }]
              : [],
          ),
        },
        options: {
          idempotencyKey: `post-analytics:${accountId}:${checkpointKey}:${hourKey}:${firstPostId}`,
          concurrencyKey: accountId,
        },
      })
    }
  }

  let enqueued = 0
  let batchCount = 0
  for (const chunk of chunkArray(
    items.filter(item => item.payload.posts.length > 0),
    BATCH_SIZE,
  )) {
    await tasks.batchTrigger<FetchPostAnalyticsTask>(TASK_IDS.fetchPostAnalytics, chunk)
    enqueued += chunk.reduce((sum, item) => sum + item.payload.posts.length, 0)
    batchCount += 1
  }
  return { enqueued, batchCount }
}

/**
 * Enqueue-only hourly sweep: skip closed windows, lease due checkpoints,
 * batchTrigger fetch workers, then backfill schedules for already-published posts.
 *
 * External cron should hit `POST /cron/analytics/posts/sweep` once an hour.
 */
export const postAnalyticsSweep = schemaTask({
  id: TASK_IDS.postAnalyticsSweep,
  schema: postAnalyticsSweepPayloadSchema,
  maxDuration: 600,
  retry: { maxAttempts: 1 },
  run: async payload => {
    try {
      await connectDb()

      const scheduledAt = payload.timestamp ? new Date(payload.timestamp) : new Date()
      const hourKey = utcHourKey(scheduledAt)
      const deferUntil = new Date(scheduledAt.getTime() + POST_ANALYTICS_RETRY_DELAY_MS)

      let workspaceCursor: string | undefined
      let remaining = MAX_POST_ANALYTICS_CLAIM_PER_TICK
      let workspacesScanned = 0
      let initialized = 0
      let advanced = 0
      let deferred = 0
      let leased = 0
      let enqueued = 0
      let batchCount = 0

      do {
        const workspacePage = await listPremiumWorkspaceIds({
          cursor: workspaceCursor,
          limit: WORKSPACE_PAGE,
        })
        workspacesScanned += workspacePage.workspaceIds.length
        workspaceCursor = workspacePage.nextCursor ?? undefined

        if (workspacePage.workspaceIds.length === 0) break

        const dueLimit = Math.min(DEFAULT_POST_ANALYTICS_CLAIM_BATCH_SIZE, remaining)
        const due =
          dueLimit > 0
            ? await findDuePostAnalyticsPosts({
                workspaceIds: workspacePage.workspaceIds,
                providers: POST_ANALYTICS_PROVIDERS,
                now: scheduledAt,
                limit: dueLimit,
              })
            : []

        if (due.length > 0) {
          const eligibleAccounts = await filterPostAnalyticsEligibleAccountIds(
            uniqueAccountIds(due),
          )
          const eligibleDue = filterEligiblePosts(due, eligibleAccounts)
          const ineligibleDue = due.filter(
            post => !eligibleAccounts.has(post.account.toString()),
          )

          if (ineligibleDue.length > 0) {
            await deferPostAnalyticsPosts(
              ineligibleDue.map(post => post._id.toString()),
              deferUntil,
            )
            deferred += ineligibleDue.length
            remaining = Math.max(0, remaining - ineligibleDue.length)
          }

          const { toFetch, toAdvance } = partitionDuePosts(eligibleDue, scheduledAt)

          if (toAdvance.length > 0) {
            const moved = await bulkAdvanceMissedPostAnalytics(toAdvance, scheduledAt)
            advanced += moved
            remaining = Math.max(0, remaining - toAdvance.length)
          }

          const leaseBudget = Math.min(toFetch.length, remaining)
          const leasedPosts =
            leaseBudget > 0
              ? await leasePostAnalyticsPosts({
                  postIds: toFetch.slice(0, leaseBudget).map(post => post._id.toString()),
                  now: scheduledAt,
                })
              : []
          leased += leasedPosts.length
          remaining = Math.max(0, remaining - leasedPosts.length)

          const queued = await enqueueLeasedPosts(leasedPosts, hourKey)
          enqueued += queued.enqueued
          batchCount += queued.batchCount
        }

        const initLimit = Math.min(DEFAULT_POST_ANALYTICS_CLAIM_BATCH_SIZE, remaining)
        if (initLimit > 0) {
          const unscheduled = await findUnscheduledPostAnalyticsPosts({
            workspaceIds: workspacePage.workspaceIds,
            providers: POST_ANALYTICS_PROVIDERS,
            now: scheduledAt,
            limit: initLimit,
          })
          const eligibleUnscheduled = await filterPostAnalyticsEligibleAccountIds(
            uniqueAccountIds(unscheduled),
          )
          const toInit = filterEligiblePosts(unscheduled, eligibleUnscheduled)
          if (toInit.length > 0) {
            const seeded = await initializePostAnalyticsSchedules(toInit, scheduledAt)
            initialized += seeded
            remaining = Math.max(0, remaining - toInit.length)
          }
        }

        if (remaining <= 0) break
      } while (workspaceCursor)

      logger.info('Post analytics sweep enqueued hourly batch', {
        hourKey,
        workspacesScanned,
        initialized,
        advanced,
        deferred,
        leased,
        enqueued,
        batchCount,
        remaining,
      })

      return {
        hourKey,
        workspacesScanned,
        initialized,
        advanced,
        deferred,
        leased,
        enqueued,
        batchCount,
        remaining,
      }
    } finally {
      await disconnectDb()
    }
  },
})

export type PostAnalyticsSweepTask = typeof postAnalyticsSweep
