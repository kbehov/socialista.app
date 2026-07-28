'use server'

import { ANALYTICS_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  AccountAnalyticsResponse,
  AnalyticsAnomaliesResponse,
  AnalyticsGrowthResponse,
  AnalyticsOverviewResponse,
  AnalyticsPlatformsResponse,
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

const overviewTag = (workspaceId: string) => `workspace-analytics-${workspaceId}`

/** Tiered overview: free stats always; premium totals when the workspace is Pro+. */
export const getAnalyticsOverview = async (
  workspaceId: string,
  query?: GetAnalyticsQuery,
): Promise<ApiResponse<AnalyticsOverviewResponse>> => {
  const path = withRange(ANALYTICS_ROUTES.GET_OVERVIEW(workspaceId), query?.range)
  return api.get<AnalyticsOverviewResponse>(path, {
    next: {
      revalidate: 300,
      tags: [overviewTag(workspaceId)],
    },
  })
}

/** Workspace growth series + per-provider breakdown (Pro). */
export const getAnalyticsGrowth = async (
  workspaceId: string,
  query?: GetAnalyticsQuery,
): Promise<ApiResponse<AnalyticsGrowthResponse>> => {
  const path = withRange(ANALYTICS_ROUTES.GET_GROWTH(workspaceId), query?.range)
  return api.get<AnalyticsGrowthResponse>(path, {
    next: {
      revalidate: 300,
      tags: [overviewTag(workspaceId)],
    },
  })
}

/** Side-by-side platform performance (Pro). */
export const getAnalyticsPlatforms = async (
  workspaceId: string,
  query?: GetAnalyticsQuery,
): Promise<ApiResponse<AnalyticsPlatformsResponse>> => {
  const path = withRange(ANALYTICS_ROUTES.GET_PLATFORMS(workspaceId), query?.range)
  return api.get<AnalyticsPlatformsResponse>(path, {
    next: {
      revalidate: 300,
      tags: [overviewTag(workspaceId)],
    },
  })
}

/** MVP anomaly flags for key metrics (Pro). */
export const getAnalyticsAnomalies = async (
  workspaceId: string,
  query?: GetAnalyticsQuery,
): Promise<ApiResponse<AnalyticsAnomaliesResponse>> => {
  const path = withRange(ANALYTICS_ROUTES.GET_ANOMALIES(workspaceId), query?.range)
  return api.get<AnalyticsAnomaliesResponse>(path, {
    next: {
      revalidate: 300,
      tags: [overviewTag(workspaceId)],
    },
  })
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
      tags: [overviewTag(workspaceId), `account-analytics-${accountId}`],
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
      tags: [overviewTag(workspaceId)],
    },
  })
}
