import { AccountModel } from '../models/account.model.js'
import { DEFAULT_ACCOUNT_PAGE_SIZE } from '../config/config.js'
import {
  ConnectionStatus,
  type CreateAccountInput,
  type IAccount,
  type SocialProvider,
  type UpdateAccountInput,
} from '../types/account.types.js'
import { isDuplicateKeyError } from '../utils/is-duplicate-key-error.js'
import {
  buildFilters,
  buildPaginationMeta,
  normalizeQuery,
} from '../utils/build-filters.js'
import { toObjectId } from '../utils/isValid.js'
import { assertValidTimezone } from '../utils/timezone.js'

/** Fields returned by workspace account list queries — keeps payloads small at scale. */
const ACCOUNT_LIST_PROJECTION = {
  _id: 1,
  workspace: 1,
  provider: 1,
  providerAccountId: 1,
  accountName: 1,
  username: 1,
  accountAvatar: 1,
  timezone: 1,
  connectionStatus: 1,
  lastError: 1,
  createdAt: 1,
} as const

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function applyAccountTextSearch(
  match: Record<string, unknown>,
  textSearch?: string,
): Record<string, unknown> {
  if (!textSearch) return match

  const regex = new RegExp(escapeRegex(textSearch), 'i')
  return {
    ...match,
    $or: [{ accountName: regex }, { username: regex }, { providerAccountId: regex }],
  }
}

/** Public account fields — tokens are never selected by default. */
export const getAccountById = async (id: string): Promise<IAccount | null> => {
  return AccountModel.findById(id).lean()
}

/** Includes OAuth tokens for publishing / refresh flows. */
export const getAccountByIdWithTokens = async (id: string): Promise<IAccount | null> => {
  return AccountModel.findById(id).select('+accessToken +refreshToken').lean()
}

export const getAccountByProvider = async (
  workspaceId: string,
  provider: SocialProvider,
  providerAccountId: string,
): Promise<IAccount | null> => {
  return AccountModel.findOne({
    workspace: toObjectId(workspaceId),
    provider,
    providerAccountId,
  }).lean()
}

export const countAccountsByWorkspace = async (workspaceId: string): Promise<number> => {
  return AccountModel.countDocuments({ workspace: toObjectId(workspaceId) })
}

export const createAccount = async (input: CreateAccountInput): Promise<IAccount> => {
  const {
    workspace,
    createdBy,
    provider,
    providerAccountId,
    accountName,
    username,
    accountAvatar,
    biography,
    followersCount,
    connectionStatus = ConnectionStatus.CONNECTED,
    scopes = [],
    metadata = {},
    accessToken,
    refreshToken,
    accessTokenExpiresAt,
    refreshTokenExpiresAt,
    lastSyncedAt,
  } = input

  if (!workspace || !createdBy || !provider || !providerAccountId || !accountName) {
    throw new Error('Workspace, createdBy, provider, providerAccountId and accountName are required')
  }

  const timezone = assertValidTimezone(input.timezone)

  try {
    const account = await AccountModel.create({
      workspace: toObjectId(workspace),
      createdBy: toObjectId(createdBy),
      provider,
      providerAccountId,
      accountName,
      timezone,
      username,
      accountAvatar,
      biography,
      followersCount,
      connectionStatus,
      scopes,
      metadata,
      accessToken,
      refreshToken,
      accessTokenExpiresAt,
      refreshTokenExpiresAt,
      lastSyncedAt: lastSyncedAt ?? new Date(),
      lastError: undefined,
    })
    return account.toObject()
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new Error('This social account is already connected to the workspace')
    }
    throw error
  }
}

/**
 * Connect or reconnect a provider account.
 * Returns `{ account, created }` so callers can update workspace usage only on create.
 */
export const upsertAccount = async (
  input: CreateAccountInput,
): Promise<{ account: IAccount; created: boolean }> => {
  const existing = await getAccountByProvider(input.workspace, input.provider, input.providerAccountId)

  if (!existing) {
    const account = await createAccount(input)
    return { account, created: true }
  }

  const account = await updateAccount(existing._id.toString(), {
    accountName: input.accountName,
    username: input.username,
    accountAvatar: input.accountAvatar,
    biography: input.biography,
    followersCount: input.followersCount,
    timezone: input.timezone,
    connectionStatus: input.connectionStatus ?? ConnectionStatus.CONNECTED,
    scopes: input.scopes,
    metadata: input.metadata,
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    accessTokenExpiresAt: input.accessTokenExpiresAt ?? null,
    refreshTokenExpiresAt: input.refreshTokenExpiresAt ?? null,
    lastSyncedAt: input.lastSyncedAt ?? new Date(),
    lastError: null,
  })

  if (!account) {
    throw new Error('Account not found')
  }

  return { account, created: false }
}

export const updateAccount = async (
  id: string,
  updates: UpdateAccountInput,
): Promise<IAccount | null> => {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, ''> = {}

  const normalized: UpdateAccountInput = { ...updates }
  if (normalized.timezone !== undefined) {
    normalized.timezone = assertValidTimezone(normalized.timezone)
  }

  const assignable: Array<keyof UpdateAccountInput> = [
    'accountName',
    'username',
    'accountAvatar',
    'biography',
    'followersCount',
    'timezone',
    'connectionStatus',
    'scopes',
    'metadata',
    'accessToken',
    'refreshToken',
  ]

  for (const key of assignable) {
    const value = normalized[key]
    if (value !== undefined) {
      $set[key] = value
    }
  }

  const nullableDateFields = ['accessTokenExpiresAt', 'refreshTokenExpiresAt', 'lastSyncedAt'] as const
  for (const key of nullableDateFields) {
    const value = normalized[key]
    if (value === undefined) continue
    if (value === null) {
      $unset[key] = ''
    } else {
      $set[key] = value
    }
  }

  if (normalized.lastError !== undefined) {
    if (normalized.lastError === null) {
      $unset.lastError = ''
    } else {
      $set.lastError = normalized.lastError
    }
  }

  const updateQuery: Record<string, unknown> = {}
  if (Object.keys($set).length > 0) updateQuery.$set = $set
  if (Object.keys($unset).length > 0) updateQuery.$unset = $unset

  if (Object.keys(updateQuery).length === 0) {
    return getAccountById(id)
  }

  return AccountModel.findByIdAndUpdate(id, updateQuery, { new: true }).lean()
}

export const updateConnectionStatus = async (
  id: string,
  connectionStatus: ConnectionStatus,
  lastError?: string | null,
): Promise<IAccount | null> => {
  return updateAccount(id, {
    connectionStatus,
    lastError: lastError === undefined ? undefined : lastError,
  })
}

export const disconnectAccount = async (id: string): Promise<IAccount | null> => {
  return AccountModel.findByIdAndUpdate(
    id,
    {
      $set: { connectionStatus: ConnectionStatus.DISCONNECTED },
      $unset: {
        accessToken: '',
        refreshToken: '',
        accessTokenExpiresAt: '',
        refreshTokenExpiresAt: '',
        lastError: '',
      },
    },
    { new: true },
  ).lean()
}

/**
 * Connected accounts whose access token expires within `withinDays` (exclusive of now, inclusive of the window end).
 * Includes OAuth tokens for refresh flows.
 */
export const getConnectedAccountsExpiringSoon = async (
  withinDays = 2,
): Promise<IAccount[]> => {
  const now = new Date()
  const windowEnd = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000)

  return AccountModel.find({
    connectionStatus: ConnectionStatus.CONNECTED,
    accessToken: { $exists: true, $nin: [null, ''] },
    accessTokenExpiresAt: { $gt: now, $lte: windowEnd },
  })
    .select('+accessToken +refreshToken')
    .lean()
}

/** Soft-disconnect after a failed token refresh — clears tokens but keeps lastError. */
export const disconnectAccountWithError = async (
  id: string,
  lastError: string,
): Promise<IAccount | null> => {
  return AccountModel.findByIdAndUpdate(
    id,
    {
      $set: {
        connectionStatus: ConnectionStatus.DISCONNECTED,
        lastError,
      },
      $unset: {
        accessToken: '',
        refreshToken: '',
        accessTokenExpiresAt: '',
        refreshTokenExpiresAt: '',
      },
    },
    { new: true },
  ).lean()
}

export const deleteAccount = async (id: string): Promise<boolean> => {
  const deleted = await AccountModel.findByIdAndDelete(id)
  return Boolean(deleted)
}

export const getAccounts = async (query: string) => {
  const normalized = normalizeQuery(query)
  if (!normalized.limit) {
    normalized.limit = String(DEFAULT_ACCOUNT_PAGE_SIZE)
  }
  if (!normalized.sort) {
    normalized.sort = 'accountName'
  }

  const { match, pagination, sort, textSearch } = buildFilters(normalized)
  const filter = applyAccountTextSearch(match, textSearch)

  const [accounts, total] = await Promise.all([
    AccountModel.find(filter)
      .select(ACCOUNT_LIST_PROJECTION)
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    AccountModel.countDocuments(filter),
  ])

  return {
    accounts: accounts as IAccount[],
    meta: buildPaginationMeta(total, pagination, sort, textSearch),
  }
}
