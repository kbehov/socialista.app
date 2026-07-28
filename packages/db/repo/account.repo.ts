import { AccountModel } from '../models/account.model.js'
import { DEFAULT_ACCOUNT_PAGE_SIZE } from '../config/config.js'
import {
  AccountAnalyticsStatus,
  ConnectionStatus,
  type CreateAccountInput,
  type IAccount,
  type SetAccountAnalyticsStateInput,
  type SocialProvider,
  type UpdateAccountInput,
} from '../types/account.types.js'
import { hashAccountRefreshSlot } from '../utils/analytics-slot.js'
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

export type WorkspaceAccountProviderStat = {
  provider: SocialProvider
  accounts: number
  followers: number | null
}

export type WorkspaceAccountStats = {
  total: number
  totalFollowers: number | null
  needsReauth: number
  byProvider: WorkspaceAccountProviderStat[]
}

/** Lightweight connected-account rollup for the free-tier analytics overview. */
export const getWorkspaceAccountStats = async (
  workspaceId: string,
): Promise<WorkspaceAccountStats> => {
  const rows = await AccountModel.aggregate<{
    _id: SocialProvider
    accounts: number
    followers: number
    hasFollowers: number
    needsReauth: number
  }>([
    { $match: { workspace: toObjectId(workspaceId) } },
    {
      $group: {
        _id: '$provider',
        accounts: { $sum: 1 },
        followers: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$followersCount', null] },
                  { $ne: ['$followersCount', undefined] },
                ],
              },
              '$followersCount',
              0,
            ],
          },
        },
        hasFollowers: {
          $max: {
            $cond: [
              {
                $and: [
                  { $ne: ['$followersCount', null] },
                  { $ne: ['$followersCount', undefined] },
                ],
              },
              1,
              0,
            ],
          },
        },
        needsReauth: {
          $sum: {
            $cond: [{ $eq: ['$analytics.status', AccountAnalyticsStatus.NEEDS_REAUTH] }, 1, 0],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ])

  let total = 0
  let totalFollowers = 0
  let sawFollowers = false
  let needsReauth = 0
  const byProvider: WorkspaceAccountProviderStat[] = []

  for (const row of rows) {
    total += row.accounts
    needsReauth += row.needsReauth
    if (row.hasFollowers) {
      totalFollowers += row.followers
      sawFollowers = true
    }
    byProvider.push({
      provider: row._id,
      accounts: row.accounts,
      followers: row.hasFollowers ? row.followers : null,
    })
  }

  return {
    total,
    totalFollowers: sawFollowers ? totalFollowers : null,
    needsReauth,
    byProvider,
  }
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

    const accountId = account._id.toString()
    const refreshSlot = hashAccountRefreshSlot(accountId)
    account.analytics = {
      ...(account.analytics ?? { status: AccountAnalyticsStatus.OK, consecutiveFailures: 0 }),
      refreshSlot,
    }
    await account.save()

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

  // Reconnect clears analytics auth failures so the next sweep can retry.
  await setAccountAnalyticsState(account._id.toString(), {
    status: AccountAnalyticsStatus.OK,
    lastError: null,
    consecutiveFailures: 0,
    refreshSlot: account.analytics?.refreshSlot ?? hashAccountRefreshSlot(account._id.toString()),
  })

  const refreshed = await getAccountById(account._id.toString())
  return { account: refreshed ?? account, created: false }
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

export type ListAnalyticsEligibleAccountsOptions = {
  workspaceIds: string[]
  /** Providers that have an analytics fetcher (e.g. Instagram only today). */
  providers: SocialProvider[]
  /**
   * Only return accounts assigned to this refresh slot (hash(accountId) % SLOT_COUNT).
   * Also includes accounts missing `analytics.refreshSlot` so they can be backfilled.
   * Omit (or pass with `forceAll`) to list every eligible account.
   */
  refreshSlot?: number
  /** When true, ignore refreshSlot filtering entirely. */
  forceAll?: boolean
  cursor?: string
  limit?: number
}

/**
 * Cursor-paged connected accounts eligible for analytics refresh.
 * Skips needs_reauth / unsupported; pages by `_id` ascending.
 */
export const listAnalyticsEligibleAccounts = async (
  options: ListAnalyticsEligibleAccountsOptions,
): Promise<{ accounts: IAccount[]; nextCursor: string | null }> => {
  const limit = Math.min(Math.max(options.limit ?? 500, 1), 1000)
  if (options.workspaceIds.length === 0 || options.providers.length === 0) {
    return { accounts: [], nextCursor: null }
  }

  const statusClause = {
    $or: [
      { 'analytics.status': { $exists: false } },
      {
        'analytics.status': {
          $nin: [AccountAnalyticsStatus.NEEDS_REAUTH, AccountAnalyticsStatus.UNSUPPORTED],
        },
      },
    ],
  }

  const andClauses: Record<string, unknown>[] = [statusClause]

  if (!options.forceAll && typeof options.refreshSlot === 'number') {
    andClauses.push({
      $or: [
        { 'analytics.refreshSlot': options.refreshSlot },
        { 'analytics.refreshSlot': { $exists: false } },
        { 'analytics.refreshSlot': null },
      ],
    })
  }

  const filter: Record<string, unknown> = {
    workspace: { $in: options.workspaceIds.map(id => toObjectId(id)) },
    provider: { $in: options.providers },
    connectionStatus: ConnectionStatus.CONNECTED,
    $and: andClauses,
  }

  if (options.cursor) {
    filter._id = { $gt: toObjectId(options.cursor) }
  }

  const accounts = await AccountModel.find(filter)
    .sort({ _id: 1 })
    .limit(limit)
    .lean()

  const nextCursor =
    accounts.length === limit ? accounts[accounts.length - 1]!._id.toString() : null

  return { accounts: accounts as IAccount[], nextCursor }
}

export const setAccountAnalyticsState = async (
  accountId: string,
  patch: SetAccountAnalyticsStateInput,
): Promise<IAccount | null> => {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, ''> = {}

  if (patch.status !== undefined) {
    $set['analytics.status'] = patch.status
  }
  if (patch.consecutiveFailures !== undefined) {
    $set['analytics.consecutiveFailures'] = patch.consecutiveFailures
  }
  if (patch.refreshSlot !== undefined) {
    $set['analytics.refreshSlot'] = patch.refreshSlot
  }
  if (patch.lastFetchedAt !== undefined) {
    if (patch.lastFetchedAt === null) {
      $unset['analytics.lastFetchedAt'] = ''
    } else {
      $set['analytics.lastFetchedAt'] = patch.lastFetchedAt
    }
  }
  if (patch.lastError !== undefined) {
    if (patch.lastError === null) {
      $unset['analytics.lastError'] = ''
    } else {
      $set['analytics.lastError'] = patch.lastError
    }
  }

  const updateQuery: Record<string, unknown> = {}
  if (Object.keys($set).length > 0) updateQuery.$set = $set
  if (Object.keys($unset).length > 0) updateQuery.$unset = $unset

  if (Object.keys(updateQuery).length === 0) {
    return getAccountById(accountId)
  }

  return AccountModel.findByIdAndUpdate(accountId, updateQuery, { new: true }).lean()
}
