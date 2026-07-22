import {
  ConnectionStatus,
  SocialProvider,
  disconnectAccountWithError,
  type IAccount,
  updateAccount,
} from '@socialista/db'

import {
  refreshInstagramAccessToken,
  refreshMetaUserAccessToken,
  refreshThreadsAccessToken,
  refreshTikTokAccessToken,
  type RefreshedTokens,
} from './providers.js'

function tokenKind(account: IAccount): string | undefined {
  const kind = account.metadata?.tokenKind
  return typeof kind === 'string' ? kind : undefined
}

async function refreshForProvider(account: IAccount): Promise<RefreshedTokens | 'skipped'> {
  const accessToken = account.accessToken
  if (!accessToken) {
    throw new Error('Account has no access token')
  }

  switch (account.provider) {
    case SocialProvider.INSTAGRAM: {
      if (tokenKind(account) === 'page_access_token') {
        return 'skipped'
      }
      return refreshInstagramAccessToken(accessToken)
    }
    case SocialProvider.THREADS:
      return refreshThreadsAccessToken(accessToken)
    case SocialProvider.TIKTOK: {
      if (!account.refreshToken) {
        throw new Error('TikTok account has no refresh token')
      }
      return refreshTikTokAccessToken(account.refreshToken)
    }
    case SocialProvider.FACEBOOK: {
      if (tokenKind(account) === 'page_access_token') {
        return 'skipped'
      }
      return refreshMetaUserAccessToken(accessToken)
    }
    default:
      throw new Error(`Token refresh is not supported for provider: ${account.provider}`)
  }
}

export type RefreshAccountResult =
  | { status: 'refreshed' }
  | { status: 'skipped'; reason: string }
  | { status: 'disconnected'; reason: string }

export async function refreshAccountTokens(account: IAccount): Promise<RefreshAccountResult> {
  if (account.connectionStatus !== ConnectionStatus.CONNECTED) {
    return { status: 'skipped', reason: 'Account is not connected' }
  }

  try {
    const result = await refreshForProvider(account)

    if (result === 'skipped') {
      return { status: 'skipped', reason: 'Provider token does not require refresh' }
    }

    await updateAccount(account._id.toString(), {
      accessToken: result.accessToken,
      accessTokenExpiresAt: result.accessTokenExpiresAt,
      ...(result.refreshToken !== undefined ? { refreshToken: result.refreshToken } : {}),
      ...(result.refreshTokenExpiresAt !== undefined
        ? { refreshTokenExpiresAt: result.refreshTokenExpiresAt }
        : {}),
      lastError: null,
      lastSyncedAt: new Date(),
    })

    return { status: 'refreshed' }
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Token refresh failed'
    await disconnectAccountWithError(account._id.toString(), reason)
    return { status: 'disconnected', reason }
  }
}
