import type { AnalyticsContext } from '@/middlewares/analytics-access.middleware.js'
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
  getAccountAnalyticsSeries,
  getAccountById,
  getAccounts,
  getLatestMissingMetrics,
  getWorkspaceAccountBreakdown,
  getWorkspaceAnalyticsSeries,
  type IAccount,
} from '@socialista/db'
import type {
  AccountAnalyticsResponse,
  AnalyticsAccountBreakdownRow,
  AnalyticsAccountInfo,
  AnalyticsDataQuality,
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
    period: {
      current: {
        start: periods.currentStart.toISOString(),
        end: periods.currentEnd.toISOString(),
      },
      previous: {
        start: periods.previousStart.toISOString(),
        end: periods.previousEnd.toISOString(),
      },
    },
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
    period: {
      current: {
        start: periods.currentStart.toISOString(),
        end: periods.currentEnd.toISOString(),
      },
      previous: {
        start: periods.previousStart.toISOString(),
        end: periods.previousEnd.toISOString(),
      },
    },
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
