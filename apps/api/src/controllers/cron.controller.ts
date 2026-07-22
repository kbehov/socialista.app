import { successResponse } from '@/utils/http-response.js'
import { getConnectedAccountsExpiringSoon } from '@socialista/db'
import { TASK_IDS } from '@socialista/types'
import type { RefreshAccountTokenTask } from '@socialista/trigger/task-types'
import { tasks } from '@trigger.dev/sdk/v3'
import type { Context } from 'hono'

function utcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10)
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
