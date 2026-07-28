'use server'

import { ANALYTICS_ROUTES } from '@/constants/routes'
import { api, ApiError } from '@/lib/api'
import type {
  AccountAnalyticsResponse,
  AnalyticsAccountPerformanceRankBy,
  AnalyticsAccountPerformanceResponse,
  AnalyticsAnomaliesResponse,
  AnalyticsGrowthResponse,
  AnalyticsOverviewResponse,
  AnalyticsPlatformsResponse,
  AnalyticsRange,
  ApiResponse,
  SocialProvider,
  WorkspaceAnalyticsSummaryResponse,
} from '@socialista/types'
import { cache } from 'react'
import { getWorkspacePublishedActivity } from './post.service'
import { getWorkspaceUsage } from './workspace.service'

export type GetAnalyticsQuery = {
  range?: AnalyticsRange
}

export type GetAnalyticsPerformanceQuery = GetAnalyticsQuery & {
  rankBy?: AnalyticsAccountPerformanceRankBy
  limit?: number
}

function withQuery(path: string, query?: Record<string, string | number | undefined>): string {
  if (!query) return path
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue
    params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

function withRange(path: string, range?: AnalyticsRange): string {
  return withQuery(path, { range })
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
      revalidate: 300, // 5 minutes
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
      revalidate: 300, // 5 minutes
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
      revalidate: 300, // 5 minutes
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
      revalidate: 300, // 5 minutes
      tags: [overviewTag(workspaceId)],
    },
  })
}

/** Top winning and losing accounts for the period (Pro). */
export const getAnalyticsAccountPerformance = async (
  workspaceId: string,
  query?: GetAnalyticsPerformanceQuery,
): Promise<ApiResponse<AnalyticsAccountPerformanceResponse>> => {
  const path = withQuery(ANALYTICS_ROUTES.GET_PERFORMANCE(workspaceId), {
    range: query?.range,
    rankBy: query?.rankBy,
    limit: query?.limit,
  })
  return api.get<AnalyticsAccountPerformanceResponse>(path, {
    next: {
      revalidate: 300, // 5 minutes
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
      revalidate: 300, // 5 minutes
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
      revalidate: 300, // 5 minutes
      tags: [overviewTag(workspaceId)],
    },
  })
}

export type AnalyticsCsvExport = {
  csv: string
  filename: string
}

function filenameFromDisposition(header: string | null, fallback: string): string {
  if (!header) return fallback
  const quoted = /filename="([^"]+)"/i.exec(header)
  if (quoted?.[1]) return quoted[1]
  const plain = /filename=([^;]+)/i.exec(header)
  return plain?.[1]?.trim() || fallback
}

/** Download workspace summary account breakdown as CSV (Pro). */
export const exportWorkspaceAnalyticsSummaryCsv = async (
  workspaceId: string,
  query?: GetAnalyticsQuery,
): Promise<ApiResponse<AnalyticsCsvExport>> => {
  const range = query?.range ?? 'daily'
  const path = withRange(ANALYTICS_ROUTES.EXPORT_SUMMARY(workspaceId), query?.range)
  const { text, contentDisposition } = await api.getText(path)
  return {
    success: true,
    data: {
      csv: text,
      filename: filenameFromDisposition(contentDisposition, `analytics-summary-${range}.csv`),
    },
  }
}

/** Download a single account period summary as CSV (Pro). */
export const exportAccountAnalyticsCsv = async (
  workspaceId: string,
  accountId: string,
  query?: GetAnalyticsQuery,
): Promise<ApiResponse<AnalyticsCsvExport>> => {
  const range = query?.range ?? 'daily'
  const path = withRange(ANALYTICS_ROUTES.EXPORT_ACCOUNT(workspaceId, accountId), query?.range)
  const { text, contentDisposition } = await api.getText(path)
  return {
    success: true,
    data: {
      csv: text,
      filename: filenameFromDisposition(contentDisposition, `analytics-${accountId}-${range}.csv`),
    },
  }
}

// React Server Component cache
export const loadGrowth = cache(async ({ workspaceId, range }: { workspaceId: string; range: AnalyticsRange }) => {
  try {
    const { success, data, message } = await getAnalyticsGrowth(workspaceId, { range })
    if (!success) {
      throw new Error(message)
    }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to load growth data' }
  }
})

export const loadPlatforms = cache(async ({ workspaceId, range }: { workspaceId: string; range: AnalyticsRange }) => {
  try {
    const { success, data, message } = await getAnalyticsPlatforms(workspaceId, { range })
    if (!success) {
      throw new Error(message)
    }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to load platforms data' }
  }
})

export const loadAnomalies = cache(async ({ workspaceId, range }: { workspaceId: string; range: AnalyticsRange }) => {
  try {
    const { success, data, message } = await getAnalyticsAnomalies(workspaceId, { range })
    if (!success) {
      throw new Error(message)
    }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to load anomalies data' }
  }
})

export const loadAccountPerformance = cache(
  async ({
    workspaceId,
    range,
    rankBy,
    limit,
  }: {
    workspaceId: string
    range: AnalyticsRange
    rankBy?: AnalyticsAccountPerformanceRankBy
    limit?: number
  }) => {
    try {
      const { success, data, message } = await getAnalyticsAccountPerformance(workspaceId, {
        range,
        rankBy,
        limit,
      })
      if (!success) {
        throw new Error(message)
      }
      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to load account performance data',
      }
    }
  },
)

export const loadPublishedActivity = cache(
  async ({ workspaceId, provider }: { workspaceId: string; provider?: SocialProvider }) => {
    try {
      const { success, data, message } = await getWorkspacePublishedActivity(workspaceId, {
        days: 365,
        provider,
      })
      if (!success) {
        throw new Error(message)
      }
      return { data, error: null }
    } catch (error) {
      return { data: null, error: error instanceof Error ? error.message : 'Failed to load published activity data' }
    }
  },
)

export const loadUsage = cache(async ({ workspaceId }: { workspaceId: string }) => {
  try {
    const { success, data, message } = await getWorkspaceUsage(workspaceId)
    if (!success) {
      throw new Error(message)
    }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : 'Failed to load usage data' }
  }
})

export const loadAccountAnalytics = cache(
  async ({
    workspaceId,
    accountId,
    range,
  }: {
    workspaceId: string
    accountId: string
    range: AnalyticsRange
  }) => {
    try {
      const { success, data, message } = await getAccountAnalytics(workspaceId, accountId, { range })
      if (!success) {
        throw new Error(message)
      }
      return { data, error: null, notFound: false }
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return { data: null, error: null, notFound: true }
      }
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Failed to load account analytics',
        notFound: false,
      }
    }
  },
)
