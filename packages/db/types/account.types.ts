import type { HydratedDocument, Types } from 'mongoose'

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  PENDING = 'pending',
  ERROR = 'error',
}

export enum SocialProvider {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  LINKEDIN = 'linkedin',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
  PINTEREST = 'pinterest',
  THREADS = 'threads',
}

/** Analytics sync state — separate from connectionStatus so insights auth issues never block publishing. */
export enum AccountAnalyticsStatus {
  OK = 'ok',
  NEEDS_REAUTH = 'needs_reauth',
  UNSUPPORTED = 'unsupported',
  ERROR = 'error',
}

export type AccountAnalyticsState = {
  status: AccountAnalyticsStatus
  lastFetchedAt?: Date
  lastError?: string
  consecutiveFailures: number
  /**
   * Slot in `[0, ANALYTICS_SLOT_COUNT)` derived from account id hash.
   * Sweep ticks only process accounts whose slot matches the current 5-minute window.
   */
  refreshSlot?: number
}

/** A social platform account connected to a workspace for publishing. */
export interface IAccount {
  _id: Types.ObjectId
  workspace: Types.ObjectId
  createdBy: Types.ObjectId
  provider: SocialProvider
  providerAccountId: string
  accountName: string
  username?: string
  accountAvatar?: string
  biography?: string
  followersCount?: number
  timezone: string
  connectionStatus: ConnectionStatus
  scopes: string[]
  /** Provider-specific extras (page id, business id, etc.). */
  metadata: Record<string, unknown>
  analytics: AccountAnalyticsState
  refreshToken?: string
  accessToken?: string
  refreshTokenExpiresAt?: Date
  accessTokenExpiresAt?: Date
  lastError?: string
  lastSyncedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type AccountDocument = HydratedDocument<IAccount>

export type CreateAccountInput = {
  workspace: string
  createdBy: string
  provider: SocialProvider
  providerAccountId: string
  accountName: string
  timezone: string
  username?: string
  accountAvatar?: string
  biography?: string
  followersCount?: number
  connectionStatus?: ConnectionStatus
  scopes?: string[]
  metadata?: Record<string, unknown>
  accessToken?: string
  refreshToken?: string
  accessTokenExpiresAt?: Date
  refreshTokenExpiresAt?: Date
  lastSyncedAt?: Date
}

export type UpdateAccountInput = {
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
  accessTokenExpiresAt?: Date | null
  refreshTokenExpiresAt?: Date | null
  lastError?: string | null
  lastSyncedAt?: Date | null
}

export type SetAccountAnalyticsStateInput = {
  status?: AccountAnalyticsStatus
  lastFetchedAt?: Date | null
  lastError?: string | null
  consecutiveFailures?: number
  refreshSlot?: number
}
