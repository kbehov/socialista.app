import type { NextRequest } from 'next/server'
import { ConnectionStatus, accountIdentityKey } from '@socialista/types'
import { createAccountsBatch } from '@/services/account.service'

import { accountIdentitySet, loadWorkspaceAccounts } from '@/lib/connector/accounts'
import { accountsRedirect, ConnectorError, toOAuthErrorCode } from '@/lib/connector/errors'
import { exchangeInstagramCode } from '@/lib/connector/instagram'
import { consumeOAuthState } from '@/lib/connector/oauth'
import { requireConnectSession } from '@/lib/connector/session'

export async function GET(request: NextRequest) {
  try {
    const session = await requireConnectSession()
    const params = request.nextUrl.searchParams

    if (params.get('error')) {
      return accountsRedirect({ error: 'provider_denied' })
    }

    const code = params.get('code')
    const state = params.get('state')
    if (!code) {
      return accountsRedirect({ error: 'invalid_request' })
    }

    const oauthState = await consumeOAuthState({
      provider: 'instagram',
      userId: session.userId,
      state,
    })
    if (session.workspaceId !== oauthState.workspaceId) {
      throw new ConnectorError('invalid_state', 'Workspace mismatch', 400)
    }

    const profile = await exchangeInstagramCode(code)
    const existing = await loadWorkspaceAccounts(oauthState.workspaceId)
    const connected = accountIdentitySet(existing)

    if (connected.has(accountIdentityKey('instagram', profile.igUserId))) {
      return accountsRedirect({ skipped: 'instagram' })
    }

    const results = await createAccountsBatch([
      {
        workspaceId: oauthState.workspaceId,
        provider: 'instagram',
        providerAccountId: profile.igUserId,
        accountName: profile.accountName,
        username: profile.username,
        accountAvatar: profile.accountAvatar,
        biography: profile.biography,
        followersCount: profile.followersCount,
        connectionStatus: ConnectionStatus.CONNECTED,
        scopes: profile.scopes,
        metadata: {
          igUserId: profile.igUserId,
          accountType: profile.accountType,
          tokenKind: 'instagram_user_access_token',
        },
        accessToken: profile.accessToken,
        accessTokenExpiresAt: profile.accessTokenExpiresAt,
      },
    ])

    const outcome = results[0]
    if (!outcome || outcome.status === 'failed') {
      return accountsRedirect({ error: 'provider_error' })
    }
    if (outcome.status === 'skipped') {
      return accountsRedirect({ skipped: 'instagram' })
    }

    return accountsRedirect({ connected: 'instagram' })
  } catch (error) {
    return accountsRedirect({ error: toOAuthErrorCode(error) })
  }
}
