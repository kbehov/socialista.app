import type { NextRequest } from 'next/server'

import { accountsRedirect, ConnectorError, toOAuthErrorCode } from '@/lib/connector/errors'
import { exchangeMetaCode } from '@/lib/connector/meta'
import { consumeOAuthState, setMetaHandoff } from '@/lib/connector/oauth'
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
      provider: 'facebook',
      userId: session.userId,
      state,
    })
    if (session.workspaceId !== oauthState.workspaceId) {
      throw new ConnectorError('invalid_state', 'Workspace mismatch', 400)
    }

    const token = await exchangeMetaCode(code)
    await setMetaHandoff({
      userId: session.userId,
      workspaceId: oauthState.workspaceId,
      accessToken: token.accessToken,
      scopes: token.scopes,
      expiresAt: token.expiresAt.getTime(),
    })

    return accountsRedirect({ connected: 'facebook_pending' })
  } catch (error) {
    return accountsRedirect({ error: toOAuthErrorCode(error) })
  }
}
