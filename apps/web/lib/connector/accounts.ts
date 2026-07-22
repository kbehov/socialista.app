import { getWorkspaceAccounts } from '@/services/account.service'
import type { Account } from '@socialista/types'
import { accountIdentityKey } from '@socialista/types'

import { ConnectorError } from './errors'

export async function loadWorkspaceAccounts(workspaceId: string): Promise<Account[]> {
  const response = await getWorkspaceAccounts(workspaceId, { limit: 100 })
  if (!response.success || !response.data?.accounts) {
    throw new ConnectorError('provider_error', 'Failed to load workspace accounts', 502)
  }
  return response.data.accounts
}

export function accountIdentitySet(accounts: Account[]): Set<string> {
  return new Set(accounts.map(a => accountIdentityKey(a.provider, a.providerAccountId)))
}
