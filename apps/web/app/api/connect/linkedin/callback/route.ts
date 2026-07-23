import type { NextRequest } from 'next/server'
import { ConnectionStatus, accountIdentityKey } from '@socialista/types'
import { createAccountsBatch } from '@/services/account.service'

import { accountIdentitySet, loadWorkspaceAccounts } from '@/lib/connector/accounts'
import { accountsRedirect, ConnectorError, toOAuthErrorCode } from '@/lib/connector/errors'
import { consumeOAuthState } from '@/lib/connector/oauth'
import { requireConnectSession } from '@/lib/connector/session'
import { exchangeLinkedInCode } from '@/lib/connector/linkedin'

export async function GET(request: NextRequest) {
  try {
    const session = await requireConnectSession()
    const params = request.nextUrl.searchParams

    if (params.get('error')) {
      const providerError = params.get('error')
      if (providerError === 'unauthorized_scope_error') {
        return accountsRedirect({ error: 'scope_unauthorized' })
      }
      return accountsRedirect({ error: 'provider_denied' })
    }

    const code = params.get('code')
    const state = params.get('state')
    if (!code) {
      return accountsRedirect({ error: 'invalid_request' })
    }

    const oauthState = await consumeOAuthState({
      provider: 'linkedin',
      userId: session.userId,
      state,
    })
    if (session.workspaceId !== oauthState.workspaceId) {
      throw new ConnectorError('invalid_state', 'Workspace mismatch', 400)
    }

    const profile = await exchangeLinkedInCode(code)
    const existing = await loadWorkspaceAccounts(oauthState.workspaceId)
    const connected = accountIdentitySet(existing)

    if (connected.has(accountIdentityKey('linkedin', profile.linkedInId))) {
      return accountsRedirect({ skipped: 'linkedin' })
    }

    const results = await createAccountsBatch([
      {
        workspaceId: oauthState.workspaceId,
        provider: 'linkedin',
        providerAccountId: profile.linkedInId,
        accountName: profile.accountName,
        username: profile.username,
        accountAvatar: profile.accountAvatar,
        connectionStatus: ConnectionStatus.CONNECTED,
        scopes: profile.scopes,
        metadata: {
          linkedInId: profile.linkedInId,
          tokenKind: 'user_access_token',
        },
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        accessTokenExpiresAt: profile.accessTokenExpiresAt,
        refreshTokenExpiresAt: profile.refreshTokenExpiresAt,
      },
    ])

    const outcome = results[0]
    if (!outcome || outcome.status === 'failed') {
      return accountsRedirect({ error: 'provider_error' })
    }
    if (outcome.status === 'skipped') {
      return accountsRedirect({ skipped: 'linkedin' })
    }

    return accountsRedirect({ connected: 'linkedin' })
  } catch (error) {
    return accountsRedirect({ error: toOAuthErrorCode(error) })
  }
}
