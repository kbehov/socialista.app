import type { AppContext } from '@/middlewares/auth.middleware.js'
import {
  getAccountForMember,
  parseCreateAccountInput,
  parseUpdateAccountInput,
  serializeAccount,
  serializeAccountSummary,
  toCreateAccountInput,
  toUpdateAccountInput,
} from '@/utils/account.utils.js'
import { applyProjectQueryAlias, withQueryParam, parseParamId } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { searchAccountLocations as searchLocationsForAccount } from '@/utils/location-search.utils.js'
import { assertAccountsLimit, getWorkspaceAsMember, resolveProjectForWorkspace } from '@/utils/workspace.utils.js'
import {
  SocialProvider,
  createAccount as createAccountInDb,
  decrementAccountsUsage,
  deleteAccount as deleteAccountInDb,
  disconnectAccount as disconnectAccountInDb,
  getAccountByIdWithTokens,
  getAccountByProvider,
  getAccounts,
  incrementAccountsUsage,
  resolveAccountTimezone,
  updateAccount as updateAccountInDb,
  upsertAccount,
  type IAccount,
} from '@socialista/db'
import type { Context } from 'hono'

async function authorizeWorkspaceAccountAction(c: Context<AppContext>, workspaceId: string) {
  const userId = c.get('userId')
  const workspace = await getWorkspaceAsMember(workspaceId, userId)
  return { userId, workspace }
}

/** Connect or reconnect a social account (upsert by provider + providerAccountId). */
export const connectAccount = async (c: Context<AppContext>) => {
  const input = parseCreateAccountInput((await c.req.json()) as Record<string, unknown>)
  const userId = c.get('userId')

  const [workspace, existing] = await Promise.all([
    getWorkspaceAsMember(input.workspaceId, userId),
    getAccountByProvider(input.workspaceId, input.provider as SocialProvider, input.providerAccountId),
  ])

  if (!existing) {
    assertAccountsLimit(workspace)
  }

  const project = await resolveProjectForWorkspace(input.workspaceId, input.projectId)
  const timezone = resolveAccountTimezone(input.timezone, project.timezone || workspace.settings.timezone)
  const { account, created } = await upsertAccount(
    toCreateAccountInput({ ...input, timezone, projectId: project._id.toString() }, userId),
  )

  if (created) {
    await incrementAccountsUsage(input.workspaceId)
  }

  return successResponse(c, created ? 201 : 200, {
    account: serializeAccount(account),
    created,
  })
}

/** Create a new account without upsert (fails if already connected). */
export const createAccount = async (c: Context<AppContext>) => {
  const input = parseCreateAccountInput((await c.req.json()) as Record<string, unknown>)
  const { userId, workspace } = await authorizeWorkspaceAccountAction(c, input.workspaceId)
  assertAccountsLimit(workspace)

  const project = await resolveProjectForWorkspace(input.workspaceId, input.projectId)
  const timezone = resolveAccountTimezone(input.timezone, project.timezone || workspace.settings.timezone)
  const account = await createAccountInDb(
    toCreateAccountInput({ ...input, timezone, projectId: project._id.toString() }, userId),
  )
  await incrementAccountsUsage(input.workspaceId)

  return successResponse(c, 201, { account: serializeAccount(account) })
}

export const getWorkspaceAccounts = async (c: Context<AppContext>) => {
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await authorizeWorkspaceAccountAction(c, workspaceId)

  const data = await getAccounts(
    applyProjectQueryAlias(withQueryParam(c.req.url, 'workspace', workspaceId)),
  )
  return successResponse(
    c,
    200,
    { accounts: data.accounts.map(account => serializeAccountSummary(account as IAccount)) },
    data.meta,
  )
}

export const getAccount = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'account ID')
  const account = await getAccountForMember(id, userId)
  return successResponse(c, 200, { account: serializeAccount(account) })
}

export const updateAccount = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'account ID')
  const input = parseUpdateAccountInput((await c.req.json()) as Record<string, unknown>)
  const existing = await getAccountForMember(id, userId)

  if (input.projectId) {
    await resolveProjectForWorkspace(existing.workspace.toString(), input.projectId)
  }

  const account = await updateAccountInDb(id, toUpdateAccountInput(input))
  if (!account) {
    throw new HttpError(404, 'Account not found')
  }

  return successResponse(c, 200, { account: serializeAccount(account) })
}

export const disconnectAccount = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'account ID')
  await getAccountForMember(id, userId)

  const account = await disconnectAccountInDb(id)
  if (!account) {
    throw new HttpError(404, 'Account not found')
  }

  return successResponse(c, 200, { account: serializeAccount(account) })
}

export const deleteAccount = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'account ID')
  const account = await getAccountForMember(id, userId)

  const deleted = await deleteAccountInDb(id)
  if (!deleted) {
    throw new HttpError(404, 'Account not found')
  }

  await decrementAccountsUsage(account.workspace.toString())

  return successResponse(c, 200, { id, workspaceId: account.workspace.toString() })
}

/** Search provider place/location APIs for composer location tagging. */
export const searchAccountLocations = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'account ID')
  await getAccountForMember(id, userId)

  const query = c.req.query('q')?.trim() ?? ''
  if (query.length < 2) {
    return successResponse(c, 200, { locations: [] })
  }

  const account = await getAccountByIdWithTokens(id)
  if (!account) {
    throw new HttpError(404, 'Account not found')
  }

  const locations = await searchLocationsForAccount(account, query)
  return successResponse(c, 200, { locations })
}
