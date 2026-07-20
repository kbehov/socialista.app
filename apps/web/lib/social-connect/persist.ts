import { createAccountsBatch } from '@/services/account.service'
import type { CreateAccountPayload } from '@socialista/types'

import type { ConnectAccountResultItem } from './types'

/**
 * Persist new accounts only. Existing identities must be filtered out by the caller.
 * Concurrent duplicates (409) are reported as skipped without overwriting tokens.
 */
export async function persistNewAccounts(
  payloads: CreateAccountPayload[],
): Promise<ConnectAccountResultItem[]> {
  return createAccountsBatch(payloads)
}

export function summarizeConnectResults(results: ConnectAccountResultItem[]): {
  created: number
  skipped: number
  failed: number
} {
  return results.reduce(
    (acc, item) => {
      acc[item.status] += 1
      return acc
    },
    { created: 0, skipped: 0, failed: 0 },
  )
}
