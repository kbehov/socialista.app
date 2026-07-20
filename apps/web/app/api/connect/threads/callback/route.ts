import type { NextRequest } from 'next/server'

import {
  accountsRedirect,
  assertWorkspaceMatches,
  buildConnectedIdentitySet,
  consumeOAuthState,
  exchangeThreadsCode,
  isAlreadyConnected,
  loadWorkspaceAccounts,
  persistNewAccounts,
  requireConnectSession,
  toOAuthErrorCode,
} from '@/lib/social-connect'

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
      provider: 'threads',
      userId: session.userId,
      state,
    })
    assertWorkspaceMatches(session.workspaceId, oauthState.workspaceId)

    const profile = await exchangeThreadsCode(code)
    const existing = await loadWorkspaceAccounts(oauthState.workspaceId)
    const connected = buildConnectedIdentitySet(existing)

    if (isAlreadyConnected(connected, 'threads', profile.threadsUserId)) {
      return accountsRedirect({ skipped: 'threads' })
    }

    const results = await persistNewAccounts([
      {
        workspaceId: oauthState.workspaceId,
        provider: 'threads',
        providerAccountId: profile.threadsUserId,
        accountName: profile.accountName,
        username: profile.username,
        accountAvatar: profile.accountAvatar,
        connectionStatus: 'connected',
        scopes: profile.scopes,
        metadata: {
          threadsUserId: profile.threadsUserId,
          tokenKind: 'user_access_token',
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
      return accountsRedirect({ skipped: 'threads' })
    }

    return accountsRedirect({ connected: 'threads' })
  } catch (error) {
    return accountsRedirect({ error: toOAuthErrorCode(error) })
  }
}
