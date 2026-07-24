import { getWorkspaceAccounts } from '@/services/account.service'
import type { AccountSummary } from '@socialista/types'
import { accountIdentityKey } from '@socialista/types'

import { ConnectorError } from './errors'

const PAGE_SIZE = 100

export async function loadWorkspaceAccounts(workspaceId: string): Promise<AccountSummary[]> {
  const all: AccountSummary[] = []
  let page = 1
  let hasNextPage = true

  while (hasNextPage) {
    const response = await getWorkspaceAccounts(workspaceId, { page, limit: PAGE_SIZE })
    if (!response.success || !response.data?.accounts) {
      throw new ConnectorError('provider_error', 'Failed to load workspace accounts', 502)
    }

    all.push(...response.data.accounts)
    hasNextPage = response.data.meta.hasNextPage ?? false
    page += 1
  }

  return all
}

export function accountIdentitySet(accounts: AccountSummary[]): Set<string> {
  return new Set(accounts.map(a => accountIdentityKey(a.provider, a.providerAccountId)))
}
