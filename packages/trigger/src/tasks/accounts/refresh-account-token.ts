import {
  connectDb,
  disconnectDb,
  getAccountByIdWithTokens,
} from '@socialista/db'
import { TASK_IDS } from '@socialista/types'
import { logger, schemaTask } from '@trigger.dev/sdk/v3'

import { refreshAccountTokenPayloadSchema } from '../../schemas/refresh-account-token.schema.js'
import { refreshAccountTokens } from '../../services/token-refresh/index.js'

export const refreshAccountToken = schemaTask({
  id: TASK_IDS.refreshAccountToken,
  schema: refreshAccountTokenPayloadSchema,
  maxDuration: 60,
  retry: { maxAttempts: 1 },
  run: async (payload) => {
    try {
      await connectDb()

      const account = await getAccountByIdWithTokens(payload.accountId)
      if (!account) {
        logger.warn('Account not found for token refresh', { accountId: payload.accountId })
        return { status: 'skipped' as const, reason: 'Account not found' }
      }

      const result = await refreshAccountTokens(account)
      logger.info('Account token refresh finished', {
        accountId: payload.accountId,
        provider: account.provider,
        ...result,
      })
      return result
    } finally {
      await disconnectDb()
    }
  },
})
