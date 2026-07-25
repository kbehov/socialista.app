import {
  AccountAnalyticsStatus,
  connectDb,
  disconnectDb,
  getAccountByIdWithTokens,
  getWorkspaceById,
  hasAnalyticsAccess,
  setAccountAnalyticsState,
  updateAccount,
  upsertAnalyticsSnapshot,
} from '@socialista/db'
import { TASK_IDS } from '@socialista/types'
import { logger, queue, schemaTask, type Queue } from '@trigger.dev/sdk/v3'

import { fetchAccountAnalyticsPayloadSchema } from '../../schemas/fetch-account-analytics.schema.js'
import {
  AnalyticsAuthError,
  AnalyticsUnsupportedError,
  fetchAccountAnalytics,
} from '../../services/analytics/index.js'

const instagramAnalyticsQueue: Queue = queue({
  name: 'analytics-instagram',
  concurrencyLimit: 20,
})

function floorTo12hBucket(date: Date): Date {
  const d = new Date(date)
  d.setUTCMinutes(0, 0, 0)
  d.setUTCHours(d.getUTCHours() < 12 ? 0 : 12)
  return d
}

export const fetchAccountAnalyticsTask = schemaTask({
  id: TASK_IDS.fetchAccountAnalytics,
  schema: fetchAccountAnalyticsPayloadSchema,
  queue: instagramAnalyticsQueue,
  maxDuration: 120,
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 5_000,
    maxTimeoutInMs: 120_000,
    randomize: true,
  },
  run: async payload => {
    try {
      await connectDb()

      const account = await getAccountByIdWithTokens(payload.accountId)
      if (!account) {
        logger.warn('Account not found for analytics fetch', { accountId: payload.accountId })
        return { status: 'skipped' as const, reason: 'Account not found' }
      }

      const workspace = await getWorkspaceById(account.workspace.toString())
      if (!workspace || !hasAnalyticsAccess(workspace)) {
        logger.info('Skipping analytics — workspace lost premium access', {
          accountId: payload.accountId,
          workspaceId: account.workspace.toString(),
        })
        return { status: 'skipped' as const, reason: 'No analytics access' }
      }

      const bucketAt = floorTo12hBucket(new Date(payload.bucketAt))
      const capturedAt = new Date()
      const includeFlows = payload.includeFlows
      const windowEnd = bucketAt
      const windowStart = new Date(bucketAt.getTime() - 24 * 60 * 60 * 1000)

      try {
        const { raw, normalized } = await fetchAccountAnalytics(account, {
          includeFlows,
          window: includeFlows ? { since: windowStart, until: windowEnd } : undefined,
        })

        await upsertAnalyticsSnapshot({
          workspaceId: account.workspace.toString(),
          accountId: account._id.toString(),
          provider: account.provider,
          bucketAt,
          capturedAt,
          isDailyAnchor: includeFlows,
          windowStart: includeFlows ? windowStart : undefined,
          windowEnd: includeFlows ? windowEnd : undefined,
          metrics: normalized.metrics,
          missingMetrics: normalized.missingMetrics,
          raw: raw as Record<string, unknown>,
        })

        if (typeof normalized.metrics.followerCount === 'number') {
          await updateAccount(account._id.toString(), {
            followersCount: normalized.metrics.followerCount,
          })
        }

        await setAccountAnalyticsState(account._id.toString(), {
          status: AccountAnalyticsStatus.OK,
          lastFetchedAt: capturedAt,
          lastError: null,
          consecutiveFailures: 0,
        })

        return {
          status: 'ok' as const,
          accountId: account._id.toString(),
          bucketAt: bucketAt.toISOString(),
          missingMetrics: normalized.missingMetrics,
        }
      } catch (error) {
        if (error instanceof AnalyticsAuthError) {
          await setAccountAnalyticsState(account._id.toString(), {
            status: AccountAnalyticsStatus.NEEDS_REAUTH,
            lastError: error.message,
            consecutiveFailures: (account.analytics?.consecutiveFailures ?? 0) + 1,
          })
          logger.warn('Analytics auth failure — marked needs_reauth', {
            accountId: account._id.toString(),
            message: error.message,
          })
          return { status: 'needs_reauth' as const, reason: error.message }
        }

        if (error instanceof AnalyticsUnsupportedError) {
          await setAccountAnalyticsState(account._id.toString(), {
            status: AccountAnalyticsStatus.UNSUPPORTED,
            lastError: error.message,
          })
          return { status: 'unsupported' as const, reason: error.message }
        }

        await setAccountAnalyticsState(account._id.toString(), {
          status: AccountAnalyticsStatus.ERROR,
          lastError: error instanceof Error ? error.message : 'Analytics fetch failed',
          consecutiveFailures: (account.analytics?.consecutiveFailures ?? 0) + 1,
        })
        throw error
      }
    } finally {
      await disconnectDb()
    }
  },
})

export type FetchAccountAnalyticsTask = typeof fetchAccountAnalyticsTask
