import type { NextRequest } from 'next/server'
import { ConnectionStatus } from '@socialista/types'
import { connectAccountsBatch } from '@/services/account.service'

import { accountsRedirect, ConnectorError, toOAuthErrorCode } from '@/lib/connector/errors'
import { consumeOAuthState } from '@/lib/connector/oauth'
import { requireConnectSession } from '@/lib/connector/session'
import { exchangeXCode } from '@/lib/connector/twitter'

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
      provider: 'twitter',
      userId: session.userId,
      state,
    })
    if (session.workspaceId !== oauthState.workspaceId) {
      throw new ConnectorError('invalid_state', 'Workspace mismatch', 400)
    }
    if (!oauthState.codeVerifier) {
      throw new ConnectorError('invalid_state', 'Missing PKCE verifier', 400)
    }

    const profile = await exchangeXCode(code, oauthState.codeVerifier)
    const results = await connectAccountsBatch([
      {
        workspaceId: oauthState.workspaceId,
        projectId: session.projectId,
        provider: 'twitter',
        providerAccountId: profile.xUserId,
        accountName: profile.accountName,
        username: profile.username,
        accountAvatar: profile.accountAvatar,
        biography: profile.biography,
        followersCount: profile.followersCount,
        connectionStatus: ConnectionStatus.CONNECTED,
        scopes: profile.scopes,
        metadata: {
          xUserId: profile.xUserId,
          tokenKind: 'user_access_token',
        },
        accessToken: profile.accessToken,
        refreshToken: profile.refreshToken,
        accessTokenExpiresAt: profile.accessTokenExpiresAt,
      },
    ])

    const outcome = results[0]
    if (!outcome || outcome.status === 'failed') {
      return accountsRedirect({ error: 'provider_error' })
    }

    return accountsRedirect({ connected: 'twitter' })
  } catch (error) {
    return accountsRedirect({ error: toOAuthErrorCode(error) })
  }
}
