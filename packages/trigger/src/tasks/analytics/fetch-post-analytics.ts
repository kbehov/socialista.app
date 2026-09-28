import {
  AccountAnalyticsStatus,
  applyPostAnalyticsSchedule,
  clearPostAnalyticsLease,
  connectDb,
  disconnectDb,
  getAccountByIdWithTokens,
  getPostsByIds,
  getWorkspaceById,
  hasAnalyticsAccess,
  insertPostAnalyticsSnapshot,
  isPostAnalyticsCheckpoint,
  POST_ANALYTICS_MAX_FAILURES,
  POST_ANALYTICS_RETRY_DELAY_MS,
  postAnalyticsCheckpointHours,
  resolvePostAnalyticsSchedule,
  scheduleAfterPostAnalyticsSuccess,
  setAccountAnalyticsState,
  type IPost,
  type PostAnalyticsCheckpoint,
} from '@socialista/db'
import { TASK_IDS } from '@socialista/types'
import {
  AbortTaskRunError,
  logger,
  queue,
  schemaTask,
  type Queue,
} from '@trigger.dev/sdk/v3'

import { fetchPostAnalyticsPayloadSchema } from '../../schemas/fetch-post-analytics.schema.js'
import {
  AnalyticsAuthError,
  AnalyticsUnsupportedError,
  fetchPostAnalytics,
} from '../../services/analytics/post/index.js'
import { PublishHttpError } from '../../services/post-publishing/fetch.js'

const postAnalyticsQueue: Queue = queue({
  name: 'analytics-post',
  concurrencyLimit: 20,
})

function isRetryableHttpError(error: unknown): boolean {
  return error instanceof PublishHttpError && error.retryable
}

async function failCheckpoint(options: {
  post: IPost
  checkpointKey: PostAnalyticsCheckpoint
  now: Date
  error: unknown
}): Promise<void> {
  const { post, checkpointKey, now } = options
  if (!post.publishedAt) {
    await applyPostAnalyticsSchedule({
      postId: post._id.toString(),
      expectedCheckpointKey: checkpointKey,
      decision: { kind: 'complete' },
      now,
    })
    return
  }

  const failures = (post.postAnalytics?.consecutiveFailures ?? 0) + 1
  const message = options.error instanceof Error ? options.error.message : 'Post analytics fetch failed'

  if (failures >= POST_ANALYTICS_MAX_FAILURES) {
    logger.warn('Skipping post analytics checkpoint after repeated failures', {
      postId: post._id.toString(),
      checkpointKey,
      failures,
    })
    await applyPostAnalyticsSchedule({
      postId: post._id.toString(),
      expectedCheckpointKey: checkpointKey,
      decision: scheduleAfterPostAnalyticsSuccess(post.publishedAt, checkpointKey),
      now,
      consecutiveFailures: 0,
      lastError: message,
    })
    return
  }

  await applyPostAnalyticsSchedule({
    postId: post._id.toString(),
    expectedCheckpointKey: checkpointKey,
    decision: {
      kind: 'scheduled',
      checkpointKey,
      nextCheckpointAt: new Date(now.getTime() + POST_ANALYTICS_RETRY_DELAY_MS),
    },
    now,
    consecutiveFailures: failures,
    lastError: message,
  })
}

export const fetchPostAnalyticsTask = schemaTask({
  id: TASK_IDS.fetchPostAnalytics,
  schema: fetchPostAnalyticsPayloadSchema,
  queue: postAnalyticsQueue,
  machine: 'small-1x',
  maxDuration: 180,
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 5_000,
    maxTimeoutInMs: 120_000,
    randomize: true,
  },
  run: async payload => {
    const postIds = payload.posts.map(item => item.postId)
    try {
      await connectDb()

      const account = await getAccountByIdWithTokens(payload.accountId)
      if (!account) {
        await clearPostAnalyticsLease(postIds)
        logger.warn('Account not found for post analytics fetch', {
          accountId: payload.accountId,
        })
        throw new AbortTaskRunError('Account not found')
      }

      const workspace = await getWorkspaceById(account.workspace.toString())
      if (!workspace || !hasAnalyticsAccess(workspace)) {
        await clearPostAnalyticsLease(postIds)
        logger.info('Skipping post analytics — workspace lost premium access', {
          accountId: payload.accountId,
          workspaceId: account.workspace.toString(),
        })
        return { status: 'skipped' as const, reason: 'No analytics access' }
      }

      const posts = await getPostsByIds(postIds)
      const postsById = new Map(posts.map(post => [post._id.toString(), post]))
      const capturedAt = new Date()
      let fetched = 0
      let advanced = 0
      let failed = 0

      for (const item of payload.posts) {
        const post = postsById.get(item.postId)
        if (!post) {
          failed += 1
          continue
        }

        const leasedKey =
          post.postAnalytics?.inFlightCheckpointKey ?? post.postAnalytics?.nextCheckpointKey
        if (!isPostAnalyticsCheckpoint(leasedKey) || leasedKey !== payload.checkpointKey) {
          await clearPostAnalyticsLease([post._id.toString()])
          advanced += 1
          continue
        }

        if (!post.publishedAt || !post.providerPostId) {
          await applyPostAnalyticsSchedule({
            postId: post._id.toString(),
            expectedCheckpointKey: leasedKey,
            decision: { kind: 'complete' },
            now: capturedAt,
          })
          advanced += 1
          continue
        }

        const decision = resolvePostAnalyticsSchedule(post.publishedAt, leasedKey, capturedAt)
        if (decision.kind !== 'fetch' || decision.checkpointKey !== leasedKey) {
          await applyPostAnalyticsSchedule({
            postId: post._id.toString(),
            expectedCheckpointKey: leasedKey,
            decision,
            now: capturedAt,
          })
          advanced += 1
          continue
        }

        try {
          const { raw, normalized } = await fetchPostAnalytics(account, post.providerPostId)
          await insertPostAnalyticsSnapshot({
            workspaceId: post.workspace.toString(),
            accountId: account._id.toString(),
            postId: post._id.toString(),
            provider: post.provider,
            providerPostId: post.providerPostId,
            checkpointKey: leasedKey,
            hoursSincePublish: postAnalyticsCheckpointHours(leasedKey),
            publishedAt: post.publishedAt,
            capturedAt,
            metrics: normalized.metrics,
            missingMetrics: normalized.missingMetrics,
            raw: raw as Record<string, unknown>,
          })
          await applyPostAnalyticsSchedule({
            postId: post._id.toString(),
            expectedCheckpointKey: leasedKey,
            decision: scheduleAfterPostAnalyticsSuccess(post.publishedAt, leasedKey),
            now: capturedAt,
          })
          fetched += 1
        } catch (error) {
          if (error instanceof AnalyticsAuthError) {
            await setAccountAnalyticsState(account._id.toString(), {
              status: AccountAnalyticsStatus.NEEDS_REAUTH,
              lastError: error.message,
              consecutiveFailures: (account.analytics?.consecutiveFailures ?? 0) + 1,
            })
            const remaining = payload.posts
              .slice(payload.posts.indexOf(item))
              .map(entry => entry.postId)
            await clearPostAnalyticsLease(remaining)
            logger.warn('Post analytics auth failure — marked needs_reauth', {
              accountId: account._id.toString(),
              postId: post._id.toString(),
              message: error.message,
            })
            throw new AbortTaskRunError(error.message)
          }

          if (error instanceof AnalyticsUnsupportedError) {
            await setAccountAnalyticsState(account._id.toString(), {
              status: AccountAnalyticsStatus.UNSUPPORTED,
              lastError: error.message,
            })
            const remaining = payload.posts
              .slice(payload.posts.indexOf(item))
              .map(entry => entry.postId)
            await clearPostAnalyticsLease(remaining)
            throw new AbortTaskRunError(error.message)
          }

          if (isRetryableHttpError(error)) {
            throw error
          }

          await failCheckpoint({
            post,
            checkpointKey: leasedKey,
            now: capturedAt,
            error,
          })
          failed += 1
        }
      }

      return {
        status: 'ok' as const,
        accountId: account._id.toString(),
        checkpointKey: payload.checkpointKey,
        fetched,
        advanced,
        failed,
      }
    } finally {
      await disconnectDb()
    }
  },
})

export type FetchPostAnalyticsTask = typeof fetchPostAnalyticsTask
