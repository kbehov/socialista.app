import type { MetaResponse } from './common.types.js'

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  PENDING = 'pending',
  ERROR = 'error',
}

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

export type SocialAccountResponse = {
  providerAccountId: string
  platform: SocialProvider
  workspaceId: string
  accountName: string
  username: string
  accountAvatar: string | null
  timezone: string
  connectionStatus: ConnectionStatus
  scopes: string[]
  metadata: Record<string, unknown>
  accessToken: string
  expiresAt: number
  lastSyncedAt?: Date
}

export type FacebookPageResponse = {
  id: string
  name: string
  category?: string
  access_token: string
  expires_at: number
  username?: string
  description?: string
  about?: string
  bio?: string
  scopes?: string[]
  picture?: {
    data: {
      url: string
    }
  }
  fan_count?: number
  lastSyncedAt?: Date
}
