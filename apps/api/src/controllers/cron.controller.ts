import { successResponse } from '@/utils/http-response.js'
import {
  DEFAULT_PUBLISH_CLAIM_BATCH_SIZE,
  MAX_PUBLISH_CLAIM_BATCH_SIZE,
  MAX_PUBLISH_CLAIM_PER_TICK,
  claimDuePosts,
  getConnectedAccountsExpiringSoon,
  getDatabaseNow,
  markPostQueued,
  reclaimStalePublishingPosts,
  releasePostClaim,
  type IPost,
} from '@socialista/db'
import { TASK_IDS } from '@socialista/types'
import type { PublishPostTask, RefreshAccountTokenTask } from '@socialista/trigger/task-types'
import { tasks } from '@trigger.dev/sdk/v3'
import { randomUUID } from 'node:crypto'
import type { Context } from 'hono'

function utcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
}

function publishIdempotencyKey(postId: string, scheduleRevision: number): string {
  return `publish-post:${postId}:rev:${scheduleRevision}`
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

type EnqueueOutcome = {
  queued: number
  failed: number
  batchIds: string[]
  released: string[]
}

async function enqueuePublishBatch(posts: IPost[], claimToken: string): Promise<EnqueueOutcome> {
  if (posts.length === 0) {
    return { queued: 0, failed: 0, batchIds: [], released: [] }
  }

  const batchIds: string[] = []
  const released: string[] = []
  let queued = 0
  let failed = 0

  const chunks = chunkArray(posts, MAX_PUBLISH_CLAIM_BATCH_SIZE)

  for (const chunk of chunks) {
    const items = chunk.map(post => {
      const postId = post._id.toString()
      const scheduleRevision = post.scheduleRevision ?? 0
      return {
        payload: {
          postId,
          accountId: post.account.toString(),
          scheduleRevision,
          claimToken,
        },
        options: {
          idempotencyKey: publishIdempotencyKey(postId, scheduleRevision),
          concurrencyKey: post.account.toString(),
          queue: 'publish-post',
        },
      }
    })

    try {
      const handle = await tasks.batchTrigger<PublishPostTask>(TASK_IDS.publishPost, items)
      const batchId = handle.batchId
      batchIds.push(batchId)

      // Batch handles expose batchId/runCount only — individual run IDs are set by the task on start.
      await Promise.all(
        chunk.map(async post => {
          const postId = post._id.toString()
          const scheduleRevision = post.scheduleRevision ?? 0
          await markPostQueued({
            postId,
            scheduleRevision,
            claimToken,
            triggerBatchId: batchId,
          })
        }),
      )
      queued += chunk.length
    } catch {
      failed += chunk.length
      await Promise.all(
        chunk.map(async post => {
          const postId = post._id.toString()
          const releasedPost = await releasePostClaim(postId, {
            claimToken,
            scheduleRevision: post.scheduleRevision ?? 0,
          })
          if (releasedPost) released.push(postId)
        }),
      )
    }
  }

  return { queued, failed, batchIds, released }
}

export const refreshExpiringAccountTokens = async (c: Context) => {
  const accounts = await getConnectedAccountsExpiringSoon(2)
  const dateKey = utcDateKey()

  const results = await Promise.all(
    accounts.map(async account => {
      const accountId = account._id.toString()
      const handle = await tasks.trigger<RefreshAccountTokenTask>(
        TASK_IDS.refreshAccountToken,
        { accountId },
        { idempotencyKey: `refresh-account:${accountId}:${dateKey}` },
      )
      return { accountId, runId: handle.id }
    }),
  )

  return successResponse(c, 200, {
    queued: results.length,
    accountIds: results.map(r => r.accountId),
    runs: results,
  })
}

/**
 * Claim due scheduled posts (and reclaim stale unstarted claims), then batch-enqueue
 * one Trigger.dev publish task per post. Bound per tick for high-volume safety.
 */
export const publishDuePosts = async (c: Context) => {
  const now = await getDatabaseNow()
  const claimToken = randomUUID()
  const batchSize = DEFAULT_PUBLISH_CLAIM_BATCH_SIZE

  let claimed = 0
  let queued = 0
  let failed = 0
  let staleReclaimed = 0
  const batchIds: string[] = []
  const released: string[] = []

  const stale = await reclaimStalePublishingPosts({
    now,
    claimToken,
    limit: batchSize,
  })
  staleReclaimed = stale.posts.length
  if (stale.posts.length > 0) {
    const outcome = await enqueuePublishBatch(stale.posts, claimToken)
    queued += outcome.queued
    failed += outcome.failed
    batchIds.push(...outcome.batchIds)
    released.push(...outcome.released)
    claimed += stale.posts.length
  }

  while (claimed < MAX_PUBLISH_CLAIM_PER_TICK) {
    const remaining = MAX_PUBLISH_CLAIM_PER_TICK - claimed
    const limit = Math.min(batchSize, remaining)
    const due = await claimDuePosts({ now, limit, claimToken })
    if (due.posts.length === 0) break

    claimed += due.posts.length
    const outcome = await enqueuePublishBatch(due.posts, claimToken)
    queued += outcome.queued
    failed += outcome.failed
    batchIds.push(...outcome.batchIds)
    released.push(...outcome.released)

    if (due.posts.length < limit) break
  }

  return successResponse(c, 200, {
    now: now.toISOString(),
    claimed,
    queued,
    failed,
    staleReclaimed,
    batchIds,
    releasedCount: released.length,
  })
}
