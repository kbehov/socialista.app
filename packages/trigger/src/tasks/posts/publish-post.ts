import {
  completePostPublish,
  connectDb,
  disconnectDb,
  failPostPublish,
  getAccountByIdWithTokens,
  getPostById,
  markPostStarted,
  persistProviderOperation,
  PostStatus,
} from '@socialista/db'
import { TASK_IDS } from '@socialista/types'
import type { Queue } from '@trigger.dev/sdk/v3'
import { AbortTaskRunError, logger, queue, schemaTask } from '@trigger.dev/sdk/v3'

import { publishPostPayloadSchema } from '../../schemas/publish-post.schema.js'
import {
  AmbiguousPublishError,
  isRetryablePublishError,
  PermanentPublishError,
  publishPostToProvider,
  sanitizeFailureReason,
} from '../../services/post-publishing/index.js'

const publishPostQueue: Queue = queue({
  name: 'publish-post',
  // Global backpressure — per-account serialization uses concurrencyKey at trigger time.
  concurrencyLimit: 100,
})

export const publishPost = schemaTask({
  id: TASK_IDS.publishPost,
  schema: publishPostPayloadSchema,
  queue: publishPostQueue,
  maxDuration: 600,
  retry: {
    maxAttempts: 2,
    factor: 2,
    minTimeoutInMs: 2_000,
    maxTimeoutInMs: 60_000,
    randomize: true,
  },
  onFailure: async ({ payload, error, ctx }) => {
    try {
      await connectDb()
      await failPostPublish({
        postId: payload.postId,
        scheduleRevision: payload.scheduleRevision,
        claimToken: payload.claimToken,
        failureReason: sanitizeFailureReason(error),
      })
      logger.error('Publish post failed permanently', {
        postId: payload.postId,
        runId: ctx.run.id,
        error: sanitizeFailureReason(error),
      })
    } finally {
      await disconnectDb()
    }
  },
  run: async (payload, { ctx }) => {
    try {
      await connectDb()

      const started = await markPostStarted({
        postId: payload.postId,
        scheduleRevision: payload.scheduleRevision,
        claimToken: payload.claimToken,
        triggerRunId: ctx.run.id,
      })

      if (!started) {
        logger.warn('Skipping publish — claim/revision mismatch or already finalized', {
          postId: payload.postId,
          scheduleRevision: payload.scheduleRevision,
        })
        return { status: 'skipped' as const, reason: 'Claim or revision mismatch' }
      }

      if (started.status !== PostStatus.PUBLISHING) {
        return { status: 'skipped' as const, reason: `Unexpected status ${started.status}` }
      }

      const [post, account] = await Promise.all([
        getPostById(payload.postId),
        getAccountByIdWithTokens(payload.accountId),
      ])

      if (!post) {
        throw new AbortTaskRunError('Post not found')
      }
      if (!account) {
        throw new AbortTaskRunError('Account not found')
      }
      if (post.scheduleRevision !== payload.scheduleRevision) {
        throw new AbortTaskRunError('Post schedule revision changed')
      }

      try {
        const result = await publishPostToProvider({
          post,
          account,
          persistOperationId: async operationId => {
            await persistProviderOperation({
              postId: payload.postId,
              scheduleRevision: payload.scheduleRevision,
              claimToken: payload.claimToken,
              providerOperationId: operationId,
            })
          },
        })

        const completed = await completePostPublish({
          postId: payload.postId,
          scheduleRevision: payload.scheduleRevision,
          claimToken: payload.claimToken,
          providerPostId: result.providerPostId,
          providerPermalink: result.providerPermalink,
          providerOperationId: result.providerOperationId,
        })

        if (!completed) {
          logger.warn('Publish succeeded on provider but DB finalization missed claim/revision', {
            postId: payload.postId,
            providerPostId: result.providerPostId,
          })
          return {
            status: 'published_untracked' as const,
            providerPostId: result.providerPostId,
          }
        }

        return {
          status: 'published' as const,
          providerPostId: result.providerPostId,
          providerPermalink: result.providerPermalink,
        }
      } catch (error) {
        if (error instanceof AmbiguousPublishError) {
          await failPostPublish({
            postId: payload.postId,
            scheduleRevision: payload.scheduleRevision,
            claimToken: payload.claimToken,
            failureReason: error.message,
          })
          throw new AbortTaskRunError(error.message)
        }

        if (error instanceof PermanentPublishError || !isRetryablePublishError(error)) {
          await failPostPublish({
            postId: payload.postId,
            scheduleRevision: payload.scheduleRevision,
            claimToken: payload.claimToken,
            failureReason: sanitizeFailureReason(error),
          })
          throw new AbortTaskRunError(sanitizeFailureReason(error))
        }

        // Retryable — leave status as publishing for Trigger retry.
        throw error
      }
    } finally {
      await disconnectDb()
    }
  },
})
