import {
  connectDb,
  disconnectDb,
  listAnalyticsEligibleAccounts,
  listPremiumWorkspaceIds,
} from '@socialista/db'
import { TASK_IDS } from '@socialista/types'
import { logger, schemaTask, tasks } from '@trigger.dev/sdk/v3'

import { analyticsSweepPayloadSchema } from '../../schemas/analytics-sweep.schema.js'
import { ANALYTICS_SUPPORTED_PROVIDERS } from '../../services/analytics/index.js'
import type { FetchAccountAnalyticsTask } from './fetch-account-analytics.js'

const WORKSPACE_PAGE = 500
const ACCOUNT_PAGE = 500
const BATCH_SIZE = 100
const MAX_DELAY_MS = 10 * 60 * 1000

function floorTo12hBucket(date: Date): Date {
  const d = new Date(date)
  d.setUTCMinutes(0, 0, 0)
  d.setUTCHours(d.getUTCHours() < 12 ? 0 : 12)
  return d
}

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

function randomDelayMs(): number {
  return Math.floor(Math.random() * MAX_DELAY_MS)
}

/**
 * Enqueue-only sweep: pages premium workspaces + eligible accounts,
 * then fans out one fetch task per account. Never calls platform APIs.
 * Triggered by `POST /cron/analytics/sweep` (same pattern as token refresh).
 */
export const analyticsSweep = schemaTask({
  id: TASK_IDS.analyticsSweep,
  schema: analyticsSweepPayloadSchema,
  maxDuration: 600,
  retry: { maxAttempts: 1 },
  run: async payload => {
    try {
      await connectDb()

      const scheduledAt = payload.timestamp ? new Date(payload.timestamp) : new Date()
      const bucketAt = floorTo12hBucket(scheduledAt)
      const includeFlows = bucketAt.getUTCHours() === 0
      const bucketIso = bucketAt.toISOString()

      let workspaceCursor: string | undefined
      let workspacesScanned = 0
      let accountsEnqueued = 0
      let batchCount = 0

      do {
        const workspacePage = await listPremiumWorkspaceIds({
          cursor: workspaceCursor,
          limit: WORKSPACE_PAGE,
        })
        workspacesScanned += workspacePage.workspaceIds.length
        workspaceCursor = workspacePage.nextCursor ?? undefined

        if (workspacePage.workspaceIds.length === 0) break

        let accountCursor: string | undefined
        do {
          const accountPage = await listAnalyticsEligibleAccounts({
            workspaceIds: workspacePage.workspaceIds,
            providers: ANALYTICS_SUPPORTED_PROVIDERS,
            cursor: accountCursor,
            limit: ACCOUNT_PAGE,
          })
          accountCursor = accountPage.nextCursor ?? undefined

          const chunks = chunkArray(accountPage.accounts, BATCH_SIZE)
          for (const chunk of chunks) {
            const items = chunk.map(account => ({
              payload: {
                accountId: account._id.toString(),
                bucketAt: bucketIso,
                includeFlows,
              },
              options: {
                idempotencyKey: `analytics:${account._id.toString()}:${bucketIso}`,
                delay: `${randomDelayMs()}ms`,
              },
            }))

            await tasks.batchTrigger<FetchAccountAnalyticsTask>(
              TASK_IDS.fetchAccountAnalytics,
              items,
            )
            accountsEnqueued += chunk.length
            batchCount += 1
          }
        } while (accountCursor)
      } while (workspaceCursor)

      logger.info('Analytics sweep enqueued fetch tasks', {
        bucketAt: bucketIso,
        includeFlows,
        workspacesScanned,
        accountsEnqueued,
        batchCount,
      })

      return {
        bucketAt: bucketIso,
        includeFlows,
        workspacesScanned,
        accountsEnqueued,
        batchCount,
      }
    } finally {
      await disconnectDb()
    }
  },
})

export type AnalyticsSweepTask = typeof analyticsSweep
