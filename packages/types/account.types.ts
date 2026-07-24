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

/** Lean account shape for paginated workspace lists — omits tokens, scopes, metadata, etc. */
export type AccountSummary = {
  _id: string
  workspaceId: string
  provider: SocialProvider
  providerAccountId: string
  accountName: string
  username?: string
  accountAvatar?: string
  timezone: string
  connectionStatus: ConnectionStatus
  lastError?: string
  createdAt: Date
}

/** Public account shape — OAuth tokens are never exposed over the API. */
export type Account = AccountSummary & {
  createdBy: string
  biography?: string
  followersCount?: number
  scopes: string[]
  metadata: Record<string, unknown>
  accessTokenExpiresAt?: Date
  refreshTokenExpiresAt?: Date
  lastSyncedAt?: Date
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
  biography?: string
  followersCount?: number
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
  biography?: string
  followersCount?: number
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
  accounts: AccountSummary[]
  meta: MetaResponse
}

export type ConnectAccountResult = {
  account: Account
  created: boolean
}

// --- OAuth connector wire types (web connect routes) ---

export type ConnectProvider = 'facebook' | 'instagram' | 'tiktok' | 'threads' | 'linkedin'

export type OAuthErrorCode =
  | 'unauthorized'
  | 'no_workspace'
  | 'provider_denied'
  | 'invalid_state'
  | 'expired'
  | 'misconfigured'
  | 'provider_error'
  | 'invalid_request'
  | 'not_found'
  | 'scope_unauthorized'

export type MetaCandidateId = `facebook:${string}` | `instagram:${string}`

export type MetaCandidate = {
  id: MetaCandidateId
  provider: Extract<SocialProvider, 'facebook' | 'instagram'>
  providerAccountId: string
  accountName: string
  username?: string
  accountAvatar?: string
  biography?: string
  followersCount?: number
  alreadyConnected: boolean
  metadata: {
    /** Present when the IG account is linked through a Facebook Page. */
    pageId?: string
    pageName?: string
    igUserId?: string
    tasks?: string[]
    tokenKind?: 'page_access_token' | 'instagram_user_access_token'
  }
}

export type ConnectAccountResultItem = {
  provider: SocialProvider
  providerAccountId: string
  accountName: string
  status: 'created' | 'skipped' | 'failed'
  accountId?: string
  message?: string
}

export function accountIdentityKey(provider: SocialProvider, providerAccountId: string): string {
  return `${provider}:${providerAccountId}`
}

export function parseMetaCandidateId(id: string): {
  provider: 'facebook' | 'instagram'
  providerAccountId: string
} | null {
  const [provider, ...rest] = id.split(':')
  const providerAccountId = rest.join(':')
  if ((provider !== 'facebook' && provider !== 'instagram') || !providerAccountId) {
    return null
  }
  return { provider, providerAccountId }
}
