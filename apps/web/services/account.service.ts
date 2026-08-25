'use server'

import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { ACCOUNT_ROUTES } from '@/constants/routes'
import { api, ApiError } from '@/lib/api'
import type {
  Account,
  ApiResponse,
  ConnectAccountResult,
  ConnectAccountResultItem,
  CreateAccountPayload,
  GetAccountsResponse,
  LocationSearchResult,
  UpdateAccountPayload,
} from '@socialista/types'
import { revalidatePath, revalidateTag } from 'next/cache'

const ACCOUNTS_PATH = DASHBOARD_ROUTES.ACCOUNTS
const ACCOUNTS_CACHE_REVALIDATE = 300

function workspaceAccountsTag(workspaceId: string) {
  return `workspace-accounts-${workspaceId}`
}

function revalidateWorkspaceAccounts(workspaceId?: string) {
  revalidatePath(ACCOUNTS_PATH)
  revalidatePath(DASHBOARD_ROUTES.POSTS)
  revalidatePath(`${DASHBOARD_ROUTES.POSTS}/create`)
  if (!workspaceId) return
  revalidateTag(workspaceAccountsTag(workspaceId), 'max')
}

/** Connect or reconnect a social account (upsert by provider + providerAccountId). */
export const connectAccount = async (payload: CreateAccountPayload): Promise<ApiResponse<ConnectAccountResult>> => {
  const response = await api.post<ConnectAccountResult>(ACCOUNT_ROUTES.CONNECT, payload)
  revalidateWorkspaceAccounts(payload.workspaceId)
  return response
}

/** Create a new account (fails if already connected). */
export const createAccount = async (payload: CreateAccountPayload): Promise<ApiResponse<{ account: Account }>> => {
  const response = await api.post<{ account: Account }>(ACCOUNT_ROUTES.CREATE, payload)
  revalidateWorkspaceAccounts(payload.workspaceId)
  return response
}

/**
 * Connect or reconnect multiple accounts sequentially (upsert by provider + providerAccountId).
 * Existing accounts get updated tokens, scopes, and profile metadata.
 */
export const connectAccountsBatch = async (
  payloads: CreateAccountPayload[],
): Promise<ConnectAccountResultItem[]> => {
  const results: ConnectAccountResultItem[] = []

  for (const payload of payloads) {
    try {
      const response = await connectAccount(payload)
      results.push({
        provider: payload.provider,
        providerAccountId: payload.providerAccountId,
        accountName: payload.accountName,
        status: response.data?.created ? 'created' : 'updated',
        accountId: response.data?.account._id,
      })
    } catch (error) {
      results.push({
        provider: payload.provider,
        providerAccountId: payload.providerAccountId,
        accountName: payload.accountName,
        status: 'failed',
        message:
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Failed to connect account',
      })
    }
  }

  return results
}

export const getAccount = async (id: string): Promise<ApiResponse<{ account: Account }>> => {
  return api.get<{ account: Account }>(ACCOUNT_ROUTES.GET_BY_ID(id))
}

export const getWorkspaceAccounts = async (
  workspaceId: string,
  query?: {
    page?: number
    limit?: number
    sort?: string
    provider?: string
    connectionStatus?: string
    /** Text search — matches account name, username, or provider account id. */
    query?: string
    projectId?: string
  },
): Promise<ApiResponse<GetAccountsResponse>> => {
  const params = new URLSearchParams()
  if (query?.page) params.set('page', String(query.page))
  if (query?.limit) params.set('limit', String(query.limit))
  if (query?.sort) params.set('sort', query.sort)
  if (query?.provider) params.set('provider', query.provider)
  if (query?.connectionStatus) params.set('connectionStatus', query.connectionStatus)
  if (query?.query) params.set('query', query.query)
  if (query?.projectId) params.set('project', query.projectId)

  const search = params.toString()
  const path = `${ACCOUNT_ROUTES.GET_WORKSPACE_ACCOUNTS(workspaceId)}${search ? `?${search}` : ''}`
  return api.get<GetAccountsResponse>(path, {
    next: {
      revalidate: ACCOUNTS_CACHE_REVALIDATE,
      tags: [workspaceAccountsTag(workspaceId)],
    },
  })
}

export const updateAccount = async (
  id: string,
  payload: UpdateAccountPayload,
): Promise<ApiResponse<{ account: Account }>> => {
  const response = await api.patch<{ account: Account }>(ACCOUNT_ROUTES.UPDATE(id), payload)
  revalidateWorkspaceAccounts(response.data?.account.workspaceId)
  return response
}

export const disconnectAccount = async (id: string): Promise<ApiResponse<{ account: Account }>> => {
  const response = await api.post<{ account: Account }>(ACCOUNT_ROUTES.DISCONNECT(id))
  revalidateWorkspaceAccounts(response.data?.account.workspaceId)
  return response
}

export const deleteAccount = async (id: string): Promise<ApiResponse<{ id: string; workspaceId: string }>> => {
  const response = await api.delete<{ id: string; workspaceId: string }>(ACCOUNT_ROUTES.DELETE(id))
  revalidateWorkspaceAccounts(response.data?.workspaceId)
  return response
}

/** Search places/locations for composer location tagging. */
export const searchAccountLocations = async (
  accountId: string,
  query: string,
): Promise<ApiResponse<{ locations: LocationSearchResult[] }>> => {
  const params = new URLSearchParams()
  params.set('q', query)
  return api.get<{ locations: LocationSearchResult[] }>(
    `${ACCOUNT_ROUTES.SEARCH_LOCATIONS(accountId)}?${params.toString()}`,
  )
}
