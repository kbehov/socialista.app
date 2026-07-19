import type { MetaResponse } from './common.types.js'

export type ConnectionStatus = 'connected' | 'disconnected' | 'pending' | 'error'

export type SocialProvider =
  | 'instagram'
  | 'facebook'
  | 'twitter'
  | 'linkedin'
  | 'tiktok'
  | 'youtube'
  | 'pinterest'
  | 'threads'

/** Public account shape — OAuth tokens are never exposed over the API. */
export type Account = {
  _id: string
  workspaceId: string
  createdBy: string
  provider: SocialProvider
  providerAccountId: string
  accountName: string
  username?: string
  accountAvatar?: string
  timezone: string
  connectionStatus: ConnectionStatus
  scopes: string[]
  metadata: Record<string, unknown>
  accessTokenExpiresAt?: Date
  refreshTokenExpiresAt?: Date
  lastError?: string
  lastSyncedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type CreateAccountPayload = {
  workspaceId: string
  provider: SocialProvider
  providerAccountId: string
  accountName: string
  /** IANA timezone; defaults to workspace.settings.timezone when omitted. */
  timezone?: string
  username?: string
  accountAvatar?: string
  connectionStatus?: ConnectionStatus
  scopes?: string[]
  metadata?: Record<string, unknown>
  accessToken?: string
  refreshToken?: string
  accessTokenExpiresAt?: string | Date
  refreshTokenExpiresAt?: string | Date
}

export type UpdateAccountPayload = {
  accountName?: string
  username?: string
  accountAvatar?: string
  timezone?: string
  connectionStatus?: ConnectionStatus
  scopes?: string[]
  metadata?: Record<string, unknown>
  accessToken?: string
  refreshToken?: string
  accessTokenExpiresAt?: string | Date | null
  refreshTokenExpiresAt?: string | Date | null
  lastError?: string | null
  lastSyncedAt?: string | Date | null
}

export type GetAccountsResponse = {
  accounts: Account[]
  meta: MetaResponse
}

export type ConnectAccountResult = {
  account: Account
  created: boolean
}
