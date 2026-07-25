'use server'

import { ANALYTICS_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  AccountAnalyticsResponse,
  AnalyticsRange,
  ApiResponse,
  WorkspaceAnalyticsSummaryResponse,
} from '@socialista/types'

export type GetAnalyticsQuery = {
  range?: AnalyticsRange
}

function withRange(path: string, range?: AnalyticsRange): string {
  if (!range) return path
  const params = new URLSearchParams({ range })
  return `${path}?${params.toString()}`
}

/** Per-account analytics with deltas, % change, and chart-ready series. */
export const getAccountAnalytics = async (
  workspaceId: string,
  accountId: string,
  query?: GetAnalyticsQuery,
): Promise<ApiResponse<AccountAnalyticsResponse>> => {
  const path = withRange(ANALYTICS_ROUTES.GET_ACCOUNT(workspaceId, accountId), query?.range)
  return api.get<AccountAnalyticsResponse>(path, {
    next: {
      revalidate: 300,
      tags: [`workspace-analytics-${workspaceId}`, `account-analytics-${accountId}`],
    },
  })
}

/** Workspace-level analytics rollup with per-account breakdown. */
export const getWorkspaceAnalyticsSummary = async (
  workspaceId: string,
  query?: GetAnalyticsQuery,
): Promise<ApiResponse<WorkspaceAnalyticsSummaryResponse>> => {
  const path = withRange(ANALYTICS_ROUTES.GET_SUMMARY(workspaceId), query?.range)
  return api.get<WorkspaceAnalyticsSummaryResponse>(path, {
    next: {
      revalidate: 300,
      tags: [`workspace-analytics-${workspaceId}`],
    },
  })
}
