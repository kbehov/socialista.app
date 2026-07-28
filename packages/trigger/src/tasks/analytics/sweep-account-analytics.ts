import {
  ANALYTICS_SLOT_COUNT,
  connectDb,
  currentAnalyticsSlotIndex,
  disconnectDb,
  floorToAnalyticsBucket,
  floorToUtcDay,
  hashAccountRefreshSlot,
  listAnalyticsEligibleAccounts,
  listPremiumWorkspaceIds,
  setAccountAnalyticsState,
  type IAccount,
} from '@socialista/db'
import { TASK_IDS } from '@socialista/types'
import { logger, schemaTask, tasks } from '@trigger.dev/sdk/v3'

import { analyticsSweepPayloadSchema } from '../../schemas/analytics-sweep.schema.js'
import { ANALYTICS_SUPPORTED_PROVIDERS } from '../../services/analytics/index.js'
import type { FetchAccountAnalyticsTask } from './fetch-account-analytics.js'

const WORKSPACE_PAGE = 500
const ACCOUNT_PAGE = 500
/** Trigger.dev batchTrigger max is 1000 (SDK 4.3.1+); keep a safe mini-batch size. */
const BATCH_SIZE = 100

function chunkArray<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

/**
 * Enqueue-only sweep for **one slot** of the rolling 12h window
 * (or all accounts when `forceAll` is set for testing).
 *
 * External cron should hit `POST /cron/analytics/sweep` every 5 minutes.
 * Each account is hashed into one of 144 slots so ~1/144 of accounts are
 * enqueued per tick — a steady trickle instead of a 100k spike twice a day.
 *
 * Uses `tasks.batchTrigger` for mini-batches (never a loop of single triggers).
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
      const forceAll = payload.forceAll === true
      // Storage is always one doc per UTC calendar day. The 12h half only controls
      // whether this run also refreshes flow metrics (00:00 half / forceAll).
      const halfBucket = floorToAnalyticsBucket(scheduledAt)
      const bucketAt = floorToUtcDay(scheduledAt)
      const includeFlows = forceAll || halfBucket.getUTCHours() === 0
      const bucketIso = bucketAt.toISOString()
      const slotIndex =
        typeof payload.slotIndex === 'number'
          ? payload.slotIndex % ANALYTICS_SLOT_COUNT
          : currentAnalyticsSlotIndex(scheduledAt)

      let workspaceCursor: string | undefined
      let workspacesScanned = 0
      let accountsScanned = 0
      let accountsEnqueued = 0
      let accountsBackfilled = 0
      let accountsSkippedWrongSlot = 0
      let batchCount = 0
      const skippedSamples: Array<{ accountId: string; refreshSlot: number }> = []

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
            refreshSlot: forceAll ? undefined : slotIndex,
            forceAll,
            cursor: accountCursor,
            limit: ACCOUNT_PAGE,
          })
          accountCursor = accountPage.nextCursor ?? undefined
          accountsScanned += accountPage.accounts.length

          const dueAccounts: IAccount[] = []
          const backfillOps: Array<Promise<unknown>> = []

          for (const account of accountPage.accounts) {
            const accountId = account._id.toString()
            let refreshSlot = account.analytics?.refreshSlot

            if (typeof refreshSlot !== 'number') {
              refreshSlot = hashAccountRefreshSlot(accountId)
              backfillOps.push(setAccountAnalyticsState(accountId, { refreshSlot }))
            }

            if (forceAll || refreshSlot === slotIndex) {
              dueAccounts.push(account)
            } else {
              accountsSkippedWrongSlot += 1
              if (skippedSamples.length < 10) {
                skippedSamples.push({ accountId, refreshSlot })
              }
            }
          }

          if (backfillOps.length > 0) {
            await Promise.all(backfillOps)
            accountsBackfilled += backfillOps.length
          }

          const chunks = chunkArray(dueAccounts, BATCH_SIZE)
          for (const chunk of chunks) {
            const items = chunk.map(account => ({
              payload: {
                accountId: account._id.toString(),
                bucketAt: bucketIso,
                includeFlows,
              },
              options: {
                // forceAll uses a distinct key so manual retests still enqueue
                idempotencyKey: forceAll
                  ? `analytics-force:${account._id.toString()}:${bucketIso}:${Date.now()}`
                  : `analytics:${account._id.toString()}:${bucketIso}`,
              },
            }))

            // Prefer one shared timestamp suffix per forceAll batch for idempotency stability within the batch
            if (forceAll) {
              const forceKey = `analytics-force:${bucketIso}:${scheduledAt.toISOString()}`
              for (const item of items) {
                item.options.idempotencyKey = `${forceKey}:${item.payload.accountId}`
              }
            }

            await tasks.batchTrigger<FetchAccountAnalyticsTask>(
              TASK_IDS.fetchAccountAnalytics,
              items,
            )
            accountsEnqueued += chunk.length
            batchCount += 1
          }
        } while (accountCursor)
      } while (workspaceCursor)

      logger.info('Analytics sweep enqueued slot batch', {
        bucketAt: bucketIso,
        slotIndex,
        slotCount: ANALYTICS_SLOT_COUNT,
        forceAll,
        includeFlows,
        workspacesScanned,
        accountsScanned,
        accountsEnqueued,
        accountsBackfilled,
        accountsSkippedWrongSlot,
        skippedSamples,
        batchCount,
      })

      return {
        bucketAt: bucketIso,
        slotIndex,
        slotCount: ANALYTICS_SLOT_COUNT,
        forceAll,
        includeFlows,
        workspacesScanned,
        accountsScanned,
        accountsEnqueued,
        accountsBackfilled,
        accountsSkippedWrongSlot,
        skippedSamples,
        batchCount,
      }
    } finally {
      await disconnectDb()
    }
  },
})

export type AnalyticsSweepTask = typeof analyticsSweep
