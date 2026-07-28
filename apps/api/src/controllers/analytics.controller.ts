import type { AnalyticsContext } from '@/middlewares/analytics-access.middleware.js'
import { detectAnomalies } from '@/utils/analytics-anomaly.js'
import { parseParamId } from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import {
  changePercent,
  emptyAnalyticsMetrics,
  metricsChangePercent,
  metricsDelta,
  metricsFromSeries,
  parseAnalyticsRange,
  resolveAnalyticsPeriods,
  sumMetrics,
  toSeriesPoints,
} from '@/utils/analytics.utils.js'
import {
  AccountAnalyticsStatus,
  countPostsByStatus,
  getAccountAnalyticsSeries,
  getAccountById,
  getAccounts,
  getLatestMissingMetrics,
  getWorkspaceAccountBreakdown,
  getWorkspaceAccountPerformanceLeaders,
  getWorkspaceAccountStats,
  getWorkspaceAnalyticsSeries,
  getWorkspaceGenerationSpend,
  getWorkspaceProviderBreakdown,
  getWorkspaceProviderSeries,
  hasAnalyticsAccess,
  PostStatus,
  type IAccount,
  type WorkspaceAccountPerformanceRow,
  type WorkspaceProviderBreakdownRow,
} from '@socialista/db'
import type {
  AccountAnalyticsResponse,
  AnalyticsAccountBreakdownRow,
  AnalyticsAccountInfo,
  AnalyticsAccountPerformanceRankBy,
  AnalyticsAccountPerformanceResponse,
  AnalyticsAccountPerformanceRow,
  AnalyticsAnomaliesResponse,
  AnalyticsDataQuality,
  AnalyticsGrowthResponse,
  AnalyticsMetrics,
  AnalyticsOverviewResponse,
  AnalyticsPlatformsResponse,
  WorkspaceAnalyticsSummaryResponse,
} from '@socialista/types'
import type { Context } from 'hono'

function toAccountInfo(account: IAccount): AnalyticsAccountInfo {
  return {
    id: account._id.toString(),
    provider: account.provider,
    accountName: account.accountName,
    username: account.username,
    avatar: account.accountAvatar,
  }
}

function toDataQuality(account: IAccount, missingMetrics: string[]): AnalyticsDataQuality {
  const status = account.analytics?.status ?? AccountAnalyticsStatus.OK
  return {
    status,
    lastFetchedAt: account.analytics?.lastFetchedAt?.toISOString(),
    missingMetrics,
  }
}

function periodPayload(periods: ReturnType<typeof resolveAnalyticsPeriods>) {
  return {
    current: {
      start: periods.currentStart.toISOString(),
      end: periods.currentEnd.toISOString(),
    },
    previous: {
      start: periods.previousStart.toISOString(),
      end: periods.previousEnd.toISOString(),
    },
  }
}

function metricsFromProviderRow(
  row: WorkspaceProviderBreakdownRow,
  side: 'current' | 'previous',
): AnalyticsMetrics {
  if (side === 'previous') {
    return {
      ...emptyAnalyticsMetrics(),
      followers: row.previousFollowerCount,
      posts: row.previousPostsCount,
      views: row.previousViews,
      reach: row.previousReach,
      engagement: row.previousEngagement,
      engagementRate:
        row.previousEngagement !== null && row.previousReach !== null && row.previousReach > 0
          ? row.previousEngagement / row.previousReach
          : row.previousEngagement !== null &&
              row.previousFollowerCount !== null &&
              row.previousFollowerCount > 0
            ? row.previousEngagement / row.previousFollowerCount
            : null,
    }
  }

  return {
    ...emptyAnalyticsMetrics(),
    followers: row.followerCount,
    following: row.followingCount,
    posts: row.postsCount,
    views: row.views,
    reach: row.reach,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    saves: row.saves,
    engagement: row.engagement,
    engagementRate:
      row.engagement !== null && row.reach !== null && row.reach > 0
        ? row.engagement / row.reach
        : row.engagement !== null && row.followerCount !== null && row.followerCount > 0
          ? row.engagement / row.followerCount
          : null,
  }
}

export const getAccountAnalytics = async (c: Context<AnalyticsContext>) => {
  const workspaceId = c.get('workspaceId')
  const accountId = parseParamId(c.req.param('accountId'), 'account ID')
  const range = parseAnalyticsRange(c.req.query('range'))
  const periods = resolveAnalyticsPeriods(range)

  const account = await getAccountById(accountId)
  if (!account || account.workspace.toString() !== workspaceId) {
    throw new HttpError(404, 'Account not found')
  }

  const [seriesPoints, missingMetrics] = await Promise.all([
    getAccountAnalyticsSeries({
      accountId,
      start: periods.seriesStart,
      end: periods.currentEnd,
      granularity: periods.granularity,
    }),
    getLatestMissingMetrics(accountId),
  ])

  // Also load previous period points that may fall before seriesStart for daily edge cases.
  const previousPoints =
    periods.previousStart < periods.seriesStart
      ? await getAccountAnalyticsSeries({
          accountId,
          start: periods.previousStart,
          end: periods.currentEnd,
          granularity: periods.granularity,
        })
      : seriesPoints

  const current = metricsFromSeries(previousPoints, periods.currentStart, periods.currentEnd)
  const previous = metricsFromSeries(previousPoints, periods.previousStart, periods.previousEnd)

  const chartSeries = toSeriesPoints(
    seriesPoints.filter(p => p.date >= periods.seriesStart && p.date < periods.currentEnd),
  )

  const response: AccountAnalyticsResponse = {
    account: toAccountInfo(account),
    range,
    period: periodPayload(periods),
    current,
    previous,
    delta: metricsDelta(current, previous),
    changePercent: metricsChangePercent(current, previous),
    series: chartSeries,
    dataQuality: toDataQuality(account, missingMetrics),
  }

  return successResponse(c, 200, response)
}

export const getWorkspaceAnalyticsSummary = async (c: Context<AnalyticsContext>) => {
  const workspaceId = c.get('workspaceId')
  const range = parseAnalyticsRange(c.req.query('range'))
  const periods = resolveAnalyticsPeriods(range)

  const [seriesPoints, breakdownRows, accountsResult] = await Promise.all([
    getWorkspaceAnalyticsSeries({
      workspaceId,
      start: periods.seriesStart,
      end: periods.currentEnd,
      granularity: periods.granularity,
    }),
    getWorkspaceAccountBreakdown({
      workspaceId,
      currentStart: periods.currentStart,
      currentEnd: periods.currentEnd,
      previousStart: periods.previousStart,
      previousEnd: periods.previousEnd,
    }),
    getAccounts(`workspace=${workspaceId}&limit=100`),
  ])

  const accountsById = new Map(
    accountsResult.accounts.map(account => [account._id.toString(), account as IAccount]),
  )

  const accounts: AnalyticsAccountBreakdownRow[] = breakdownRows.map(row => {
    const account = accountsById.get(row.accountId)
    const engagementRate =
      row.engagement !== null && row.reach !== null && row.reach > 0
        ? row.engagement / row.reach
        : row.engagement !== null && row.followerCount !== null && row.followerCount > 0
          ? row.engagement / row.followerCount
          : null

    const info: AnalyticsAccountInfo = account
      ? toAccountInfo(account)
      : {
          id: row.accountId,
          provider: 'instagram',
          accountName: 'Unknown',
        }

    return {
      account: info,
      followers: row.followerCount,
      views: row.views,
      engagement: row.engagement,
      engagementRate,
      followersChangePercent: changePercent(row.followerCount, row.previousFollowerCount),
      dataQuality: account
        ? toDataQuality(account, [])
        : { status: AccountAnalyticsStatus.OK, missingMetrics: [] },
    }
  })

  // Include connected accounts that have no snapshots yet so the UI can show empty rows.
  for (const account of accountsResult.accounts as IAccount[]) {
    const id = account._id.toString()
    if (accounts.some(row => row.account.id === id)) continue
    accounts.push({
      account: toAccountInfo(account),
      followers: account.followersCount ?? null,
      views: null,
      engagement: null,
      engagementRate: null,
      followersChangePercent: null,
      dataQuality: toDataQuality(account, []),
    })
  }

  const totals = sumMetrics(
    accounts.map(row => ({
      followers: row.followers,
      following: null,
      posts: null,
      views: row.views,
      reach: null,
      likes: null,
      comments: null,
      shares: null,
      saves: null,
      engagement: row.engagement,
      engagementRate: row.engagementRate,
    })),
  )

  // Prefer breakdown-derived totals for followers/views/engagement; fill posts/reach from series.
  const currentFromSeries = metricsFromSeries(
    seriesPoints,
    periods.currentStart,
    periods.currentEnd,
  )
  const previousFromSeries = metricsFromSeries(
    seriesPoints,
    periods.previousStart,
    periods.previousEnd,
  )

  const currentTotals = {
    ...emptyAnalyticsMetrics(),
    ...currentFromSeries,
    followers: totals.followers ?? currentFromSeries.followers,
    views: totals.views ?? currentFromSeries.views,
    engagement: totals.engagement ?? currentFromSeries.engagement,
    engagementRate:
      totals.engagement !== null
        ? totals.engagementRate
        : currentFromSeries.engagementRate,
  }

  const previousTotals = previousFromSeries

  let topAccount: AnalyticsAccountBreakdownRow | null = null
  for (const row of accounts) {
    if (row.engagement === null) continue
    if (!topAccount || (topAccount.engagement ?? -1) < row.engagement) {
      topAccount = row
    }
  }

  const accountsNeedingReauth = (accountsResult.accounts as IAccount[]).filter(
    a => a.analytics?.status === AccountAnalyticsStatus.NEEDS_REAUTH,
  ).length

  const response: WorkspaceAnalyticsSummaryResponse = {
    range,
    period: periodPayload(periods),
    totals: currentTotals,
    previousTotals,
    delta: metricsDelta(currentTotals, previousTotals),
    changePercent: metricsChangePercent(currentTotals, previousTotals),
    series: toSeriesPoints(
      seriesPoints.filter(p => p.date >= periods.seriesStart && p.date < periods.currentEnd),
    ),
    accounts,
    topAccount,
    meta: {
      accountsCovered: accounts.length,
      accountsNeedingReauth,
    },
  }

  return successResponse(c, 200, response)
}

/** Fast overview: free stats for everyone; premium totals when the workspace is Pro+. */
export const getAnalyticsOverview = async (c: Context<AnalyticsContext>) => {
  const workspace = c.get('workspace')
  const workspaceId = c.get('workspaceId')
  const range = parseAnalyticsRange(c.req.query('range'))
  const periods = resolveAnalyticsPeriods(range)
  const isPremium = hasAnalyticsAccess(workspace)

  const [accountStats, postCounts, spend, seriesPoints] = await Promise.all([
    getWorkspaceAccountStats(workspaceId),
    countPostsByStatus(workspaceId),
    getWorkspaceGenerationSpend({ workspaceId }),
    isPremium
      ? getWorkspaceAnalyticsSeries({
          workspaceId,
          start: periods.previousStart,
          end: periods.currentEnd,
          granularity: periods.granularity,
        })
      : Promise.resolve(null),
  ])

  const free = {
    connectedAccounts: accountStats.total,
    accountsNeedingReauth: accountStats.needsReauth,
    totalFollowers: accountStats.totalFollowers,
    accountsByProvider: accountStats.byProvider,
    scheduledPosts: postCounts[PostStatus.SCHEDULED] ?? 0,
    publishedPosts: postCounts[PostStatus.PUBLISHED] ?? 0,
    draftPosts: postCounts[PostStatus.DRAFT] ?? 0,
    spend: {
      creditsUsed: spend.creditsUsed,
      creditsRemaining: workspace.billing.aiCreditsBalance,
      generationCount: spend.generationCount,
    },
  }

  let premium: AnalyticsOverviewResponse['premium'] = null
  if (seriesPoints) {
    const totals = metricsFromSeries(seriesPoints, periods.currentStart, periods.currentEnd)
    const previousTotals = metricsFromSeries(
      seriesPoints,
      periods.previousStart,
      periods.previousEnd,
    )
    premium = {
      totals,
      previousTotals,
      delta: metricsDelta(totals, previousTotals),
      changePercent: metricsChangePercent(totals, previousTotals),
    }
  }

  const response: AnalyticsOverviewResponse = {
    tier: isPremium ? 'premium' : 'free',
    range,
    period: periodPayload(periods),
    free,
    premium,
  }

  return successResponse(c, 200, response)
}

/** Workspace growth series + per-provider breakdown for charts. */
export const getAnalyticsGrowth = async (c: Context<AnalyticsContext>) => {
  const workspaceId = c.get('workspaceId')
  const range = parseAnalyticsRange(c.req.query('range'))
  const periods = resolveAnalyticsPeriods(range)

  const [seriesPoints, providerSeries] = await Promise.all([
    getWorkspaceAnalyticsSeries({
      workspaceId,
      start: periods.seriesStart,
      end: periods.currentEnd,
      granularity: periods.granularity,
    }),
    getWorkspaceProviderSeries({
      workspaceId,
      start: periods.seriesStart,
      end: periods.currentEnd,
      granularity: periods.granularity,
    }),
  ])

  const response: AnalyticsGrowthResponse = {
    range,
    period: periodPayload(periods),
    series: toSeriesPoints(
      seriesPoints.filter(p => p.date >= periods.seriesStart && p.date < periods.currentEnd),
    ),
    byProvider: providerSeries.map(group => ({
      provider: group.provider,
      series: toSeriesPoints(
        group.points.filter(p => p.date >= periods.seriesStart && p.date < periods.currentEnd),
      ),
    })),
  }

  return successResponse(c, 200, response)
}

/** Side-by-side platform performance for the current vs previous period. */
export const getAnalyticsPlatforms = async (c: Context<AnalyticsContext>) => {
  const workspaceId = c.get('workspaceId')
  const range = parseAnalyticsRange(c.req.query('range'))
  const periods = resolveAnalyticsPeriods(range)

  const [breakdownRows, accountStats] = await Promise.all([
    getWorkspaceProviderBreakdown({
      workspaceId,
      currentStart: periods.currentStart,
      currentEnd: periods.currentEnd,
      previousStart: periods.previousStart,
      previousEnd: periods.previousEnd,
    }),
    getWorkspaceAccountStats(workspaceId),
  ])

  const accountCountByProvider = new Map(
    accountStats.byProvider.map(row => [row.provider, row.accounts]),
  )

  const platforms = breakdownRows.map(row => {
    const current = metricsFromProviderRow(row, 'current')
    const previous = metricsFromProviderRow(row, 'previous')
    return {
      provider: row.provider,
      accounts: accountCountByProvider.get(row.provider) ?? row.accountCount,
      current,
      previous,
      changePercent: metricsChangePercent(current, previous),
    }
  })

  // Include providers that have connected accounts but no snapshots yet.
  for (const row of accountStats.byProvider) {
    if (platforms.some(p => p.provider === row.provider)) continue
    const empty = emptyAnalyticsMetrics()
    platforms.push({
      provider: row.provider,
      accounts: row.accounts,
      current: { ...empty, followers: row.followers },
      previous: empty,
      changePercent: metricsChangePercent({ ...empty, followers: row.followers }, empty),
    })
  }

  const response: AnalyticsPlatformsResponse = {
    range,
    period: periodPayload(periods),
    platforms,
  }

  return successResponse(c, 200, response)
}

/** MVP anomaly flags for workspace + per-provider series. */
export const getAnalyticsAnomalies = async (c: Context<AnalyticsContext>) => {
  const workspaceId = c.get('workspaceId')
  const range = parseAnalyticsRange(c.req.query('range'))
  const periods = resolveAnalyticsPeriods(range)

  const [seriesPoints, providerSeries] = await Promise.all([
    getWorkspaceAnalyticsSeries({
      workspaceId,
      start: periods.seriesStart,
      end: periods.currentEnd,
      granularity: 'day',
    }),
    getWorkspaceProviderSeries({
      workspaceId,
      start: periods.seriesStart,
      end: periods.currentEnd,
      granularity: 'day',
    }),
  ])

  const chartSeries = toSeriesPoints(
    seriesPoints.filter(p => p.date >= periods.seriesStart && p.date < periods.currentEnd),
  )

  const anomalies = [
    ...detectAnomalies(chartSeries),
    ...providerSeries.flatMap(group =>
      detectAnomalies(
        toSeriesPoints(
          group.points.filter(p => p.date >= periods.seriesStart && p.date < periods.currentEnd),
        ),
        { provider: group.provider },
      ),
    ),
  ]

  const response: AnalyticsAnomaliesResponse = {
    range,
    period: periodPayload(periods),
    anomalies,
  }

  return successResponse(c, 200, response)
}

const PERFORMANCE_RANK_BY = new Set<AnalyticsAccountPerformanceRankBy>([
  'followerGrowth',
  'followerGrowthPercent',
  'engagement',
  'reach',
])

function parsePerformanceRankBy(value: string | undefined): AnalyticsAccountPerformanceRankBy {
  if (!value) return 'followerGrowth'
  if (PERFORMANCE_RANK_BY.has(value as AnalyticsAccountPerformanceRankBy)) {
    return value as AnalyticsAccountPerformanceRankBy
  }
  throw new HttpError(
    400,
    'rankBy must be followerGrowth, followerGrowthPercent, engagement, or reach',
  )
}

function parsePerformanceLimit(value: string | undefined): number | undefined {
  if (value === undefined || value === '') return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 1) {
    throw new HttpError(400, 'limit must be a positive number')
  }
  return parsed
}

function toPerformanceRow(
  row: WorkspaceAccountPerformanceRow,
  accountsById: Map<string, IAccount>,
): AnalyticsAccountPerformanceRow {
  const account = accountsById.get(row.accountId)
  const info: AnalyticsAccountInfo = account
    ? toAccountInfo(account)
    : {
        id: row.accountId,
        provider: row.provider,
        accountName: 'Unknown',
      }

  return {
    account: info,
    followers: row.followerCount,
    previousFollowers: row.previousFollowerCount,
    followerGrowth: row.followerGrowth,
    followerGrowthPercent: row.followerGrowthPercent,
    views: row.views,
    reach: row.reach,
    engagement: row.engagement,
    score: row.score,
  }
}

/** Top winning and losing accounts for the current vs previous period. */
export const getAnalyticsAccountPerformance = async (c: Context<AnalyticsContext>) => {
  const workspaceId = c.get('workspaceId')
  const range = parseAnalyticsRange(c.req.query('range'))
  const periods = resolveAnalyticsPeriods(range)
  const rankBy = parsePerformanceRankBy(c.req.query('rankBy'))
  const limit = parsePerformanceLimit(c.req.query('limit'))

  const [leaders, accountsResult] = await Promise.all([
    getWorkspaceAccountPerformanceLeaders({
      workspaceId,
      currentStart: periods.currentStart,
      currentEnd: periods.currentEnd,
      previousStart: periods.previousStart,
      previousEnd: periods.previousEnd,
      rankBy,
      limit,
    }),
    getAccounts(`workspace=${workspaceId}&limit=100`),
  ])

  const accountsById = new Map(
    accountsResult.accounts.map(account => [account._id.toString(), account as IAccount]),
  )

  const response: AnalyticsAccountPerformanceResponse = {
    range,
    period: periodPayload(periods),
    rankBy: leaders.rankBy,
    limit: leaders.limit,
    winners: leaders.winners.map(row => toPerformanceRow(row, accountsById)),
    losers: leaders.losers.map(row => toPerformanceRow(row, accountsById)),
  }

  return successResponse(c, 200, response)
}
