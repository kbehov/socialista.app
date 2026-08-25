import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import type {
  AnalyticsAccountPerformanceRankBy,
  AnalyticsRange,
  SocialProvider,
} from '@socialista/types'

export type AnalyticsDashboardHrefParams = {
  range: AnalyticsRange
  provider?: SocialProvider | 'all'
  rankBy?: AnalyticsAccountPerformanceRankBy
  accountId?: string
}

export function buildAnalyticsDashboardHref(
  params: AnalyticsDashboardHrefParams,
  basePath = DASHBOARD_ROUTES.ROOT,
): string {
  const search = new URLSearchParams()
  search.set('range', params.range)
  if (!params.accountId && params.provider && params.provider !== 'all') {
    search.set('provider', params.provider)
  }
  if (params.rankBy && params.rankBy !== 'followerGrowth') search.set('rankBy', params.rankBy)
  if (params.accountId) search.set('account', params.accountId)
  return `${basePath}?${search.toString()}`
}
