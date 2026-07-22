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
  UpdateAccountPayload,
} from '@socialista/types'
import { revalidatePath } from 'next/cache'

const ACCOUNTS_PATH = DASHBOARD_ROUTES.ACCOUNTS

function revalidateAccountPaths() {
  revalidatePath(ACCOUNTS_PATH)
}

/** Connect or reconnect a social account (upsert by provider + providerAccountId). */
export const connectAccount = async (
  payload: CreateAccountPayload,
): Promise<ApiResponse<ConnectAccountResult>> => {
  const response = await api.post<ConnectAccountResult>(ACCOUNT_ROUTES.CONNECT, payload)
  revalidateAccountPaths()
  return response
}

/** Create a new account (fails if already connected). */
export const createAccount = async (
  payload: CreateAccountPayload,
): Promise<ApiResponse<{ account: Account }>> => {
  const response = await api.post<{ account: Account }>(ACCOUNT_ROUTES.CREATE, payload)
  revalidateAccountPaths()
  return response
}

/**
 * Create multiple accounts sequentially.
 * Callers must omit identities already present in the workspace.
 * Concurrent duplicates (409) are reported as `skipped` and never overwrite tokens.
 */
export const createAccountsBatch = async (
  payloads: CreateAccountPayload[],
): Promise<ConnectAccountResultItem[]> => {
  const results: ConnectAccountResultItem[] = []

  for (const payload of payloads) {
    try {
      const response = await createAccount(payload)
      results.push({
        provider: payload.provider,
        providerAccountId: payload.providerAccountId,
        accountName: payload.accountName,
        status: 'created',
        accountId: response.data?.account._id,
      })
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        results.push({
          provider: payload.provider,
          providerAccountId: payload.providerAccountId,
          accountName: payload.accountName,
          status: 'skipped',
          message: 'Account already connected',
        })
        continue
      }

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

  if (payloads.length > 0) {
    revalidateAccountPaths()
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
  },
): Promise<ApiResponse<GetAccountsResponse>> => {
  const params = new URLSearchParams()
  if (query?.page) params.set('page', String(query.page))
  if (query?.limit) params.set('limit', String(query.limit))
  if (query?.sort) params.set('sort', query.sort)
  if (query?.provider) params.set('provider', query.provider)
  if (query?.connectionStatus) params.set('connectionStatus', query.connectionStatus)

  const search = params.toString()
  const path = `${ACCOUNT_ROUTES.GET_WORKSPACE_ACCOUNTS(workspaceId)}${search ? `?${search}` : ''}`
  return api.get<GetAccountsResponse>(path)
}

export const updateAccount = async (
  id: string,
  payload: UpdateAccountPayload,
): Promise<ApiResponse<{ account: Account }>> => {
  const response = await api.patch<{ account: Account }>(ACCOUNT_ROUTES.UPDATE(id), payload)
  revalidateAccountPaths()
  return response
}

export const disconnectAccount = async (
  id: string,
): Promise<ApiResponse<{ account: Account }>> => {
  const response = await api.post<{ account: Account }>(ACCOUNT_ROUTES.DISCONNECT(id))
  revalidateAccountPaths()
  return response
}

export const deleteAccount = async (id: string): Promise<ApiResponse<{ id: string }>> => {
  const response = await api.delete<{ id: string }>(ACCOUNT_ROUTES.DELETE(id))
  revalidateAccountPaths()
  return response
}
