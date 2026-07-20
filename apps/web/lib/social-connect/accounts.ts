import { getWorkspaceAccounts } from '@/services/account.service'
import type { Account, SocialProvider } from '@socialista/types'

import { SocialConnectError } from './errors'
import { accountIdentityKey } from './types'

export async function loadWorkspaceAccounts(workspaceId: string): Promise<Account[]> {
  const response = await getWorkspaceAccounts(workspaceId, { limit: 100 })
  if (!response.success || !response.data?.accounts) {
    throw new SocialConnectError('provider_error', 'Failed to load workspace accounts', 502)
  }
  return response.data.accounts
}

export function buildConnectedIdentitySet(accounts: Account[]): Set<string> {
  return new Set(
    accounts.map(account => accountIdentityKey(account.provider, account.providerAccountId)),
  )
}

export function isAlreadyConnected(
  connected: Set<string>,
  provider: SocialProvider,
  providerAccountId: string,
): boolean {
  return connected.has(accountIdentityKey(provider, providerAccountId))
}
