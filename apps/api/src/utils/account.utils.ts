import {
  assertHasUpdates,
  optionalTrimmedString,
  parseOptionalDate,
  parseOptionalNullableDate,
  parseParamId,
  parsePlainObject,
  parseStringArray,
  requireTrimmedString,
  toDate,
  toNullableDate,
} from '@/utils/common.utils.js'
import { HttpError } from '@/utils/http-response.js'
import { assertWorkspaceMember, getWorkspaceOrThrow } from '@/utils/workspace.utils.js'
import {
  ConnectionStatus,
  SocialProvider,
  assertValidTimezone,
  getAccountById,
  type CreateAccountInput,
  type IAccount,
  type UpdateAccountInput,
} from '@socialista/db'
import type {
  Account,
  ConnectionStatus as ApiConnectionStatus,
  CreateAccountPayload,
  SocialProvider as ApiSocialProvider,
  UpdateAccountPayload,
} from '@socialista/types'

const SOCIAL_PROVIDERS = new Set<string>(Object.values(SocialProvider))
const CONNECTION_STATUSES = new Set<string>(Object.values(ConnectionStatus))

export const isSocialProvider = (value: unknown): value is ApiSocialProvider =>
  typeof value === 'string' && SOCIAL_PROVIDERS.has(value)

export const isConnectionStatus = (value: unknown): value is ApiConnectionStatus =>
  typeof value === 'string' && CONNECTION_STATUSES.has(value)

export const serializeAccount = (account: IAccount): Account => ({
  _id: account._id.toString(),
  workspaceId: account.workspace.toString(),
  createdBy: account.createdBy.toString(),
  provider: account.provider,
  providerAccountId: account.providerAccountId,
  accountName: account.accountName,
  username: account.username,
  accountAvatar: account.accountAvatar,
  timezone: account.timezone,
  connectionStatus: account.connectionStatus,
  scopes: account.scopes ?? [],
  metadata: account.metadata ?? {},
  accessTokenExpiresAt: account.accessTokenExpiresAt,
  refreshTokenExpiresAt: account.refreshTokenExpiresAt,
  lastError: account.lastError,
  lastSyncedAt: account.lastSyncedAt,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
})

export const parseCreateAccountInput = (body: Record<string, unknown>): CreateAccountPayload => {
  const workspaceId = parseParamId(
    typeof body.workspaceId === 'string' ? body.workspaceId : undefined,
    'workspace ID',
  )

  if (!isSocialProvider(body.provider)) {
    throw new HttpError(400, 'Valid social provider is required')
  }

  const providerAccountId = requireTrimmedString(body.providerAccountId, 'Provider account ID')
  const accountName = requireTrimmedString(body.accountName, 'Account name')
  const timezone = optionalTrimmedString(body.timezone)

  if (timezone) {
    assertValidTimezone(timezone)
  }

  if (body.connectionStatus !== undefined && !isConnectionStatus(body.connectionStatus)) {
    throw new HttpError(400, 'Invalid connection status')
  }

  return {
    workspaceId,
    provider: body.provider,
    providerAccountId,
    accountName,
    timezone,
    username: optionalTrimmedString(body.username),
    accountAvatar: optionalTrimmedString(body.accountAvatar),
    connectionStatus: isConnectionStatus(body.connectionStatus) ? body.connectionStatus : undefined,
    scopes: parseStringArray(body.scopes, 'Scopes'),
    metadata: parsePlainObject(body.metadata, 'Metadata'),
    accessToken: optionalTrimmedString(body.accessToken),
    refreshToken: optionalTrimmedString(body.refreshToken),
    accessTokenExpiresAt: parseOptionalDate(body.accessTokenExpiresAt, 'access token expiry'),
    refreshTokenExpiresAt: parseOptionalDate(body.refreshTokenExpiresAt, 'refresh token expiry'),
  }
}

export const parseUpdateAccountInput = (body: Record<string, unknown>): UpdateAccountPayload => {
  const updates: UpdateAccountPayload = {}

  if (typeof body.accountName === 'string') {
    const accountName = body.accountName.trim()
    if (!accountName) {
      throw new HttpError(400, 'Account name cannot be empty')
    }
    updates.accountName = accountName
  }

  if (body.username !== undefined) {
    updates.username = optionalTrimmedString(body.username)
  }

  if (body.accountAvatar !== undefined) {
    updates.accountAvatar = optionalTrimmedString(body.accountAvatar)
  }

  if (typeof body.timezone === 'string') {
    updates.timezone = assertValidTimezone(body.timezone)
  }

  if (body.connectionStatus !== undefined) {
    if (!isConnectionStatus(body.connectionStatus)) {
      throw new HttpError(400, 'Invalid connection status')
    }
    updates.connectionStatus = body.connectionStatus
  }

  if (body.scopes !== undefined) {
    updates.scopes = parseStringArray(body.scopes, 'Scopes')
  }

  if (body.metadata !== undefined) {
    updates.metadata = parsePlainObject(body.metadata, 'Metadata')
  }

  if (body.accessToken !== undefined) {
    updates.accessToken = optionalTrimmedString(body.accessToken)
  }

  if (body.refreshToken !== undefined) {
    updates.refreshToken = optionalTrimmedString(body.refreshToken)
  }

  if (body.accessTokenExpiresAt !== undefined) {
    updates.accessTokenExpiresAt = parseOptionalNullableDate(
      body.accessTokenExpiresAt,
      'access token expiry',
    )
  }

  if (body.refreshTokenExpiresAt !== undefined) {
    updates.refreshTokenExpiresAt = parseOptionalNullableDate(
      body.refreshTokenExpiresAt,
      'refresh token expiry',
    )
  }

  if (body.lastError !== undefined) {
    updates.lastError =
      body.lastError === null ? null : (optionalTrimmedString(body.lastError) ?? null)
  }

  if (body.lastSyncedAt !== undefined) {
    updates.lastSyncedAt = parseOptionalNullableDate(body.lastSyncedAt, 'last synced at')
  }

  assertHasUpdates(updates)
  return updates
}

export const toCreateAccountInput = (
  input: CreateAccountPayload & { timezone: string },
  userId: string,
): CreateAccountInput => ({
  workspace: input.workspaceId,
  createdBy: userId,
  provider: input.provider as SocialProvider,
  providerAccountId: input.providerAccountId,
  accountName: input.accountName,
  timezone: input.timezone,
  username: input.username,
  accountAvatar: input.accountAvatar,
  connectionStatus:
    (input.connectionStatus as ConnectionStatus | undefined) ?? ConnectionStatus.CONNECTED,
  scopes: input.scopes,
  metadata: input.metadata,
  accessToken: input.accessToken,
  refreshToken: input.refreshToken,
  accessTokenExpiresAt: toDate(input.accessTokenExpiresAt),
  refreshTokenExpiresAt: toDate(input.refreshTokenExpiresAt),
})

export const toUpdateAccountInput = (input: UpdateAccountPayload): UpdateAccountInput => ({
  ...input,
  connectionStatus: input.connectionStatus as ConnectionStatus | undefined,
  accessTokenExpiresAt: toNullableDate(input.accessTokenExpiresAt),
  refreshTokenExpiresAt: toNullableDate(input.refreshTokenExpiresAt),
  lastSyncedAt: toNullableDate(input.lastSyncedAt),
})

export const getAccountOrThrow = async (id: string) => {
  const account = await getAccountById(id)
  if (!account) {
    throw new HttpError(404, 'Account not found')
  }
  return account
}

export const getAccountForMember = async (id: string, userId: string) => {
  const account = await getAccountOrThrow(id)
  const workspace = await getWorkspaceOrThrow(account.workspace.toString())
  assertWorkspaceMember(workspace, userId)
  return account
}
