import Link from 'next/link'

import { DashboardSegment, dashboardSegmentLinkClass } from '@/components/dashboard/dashboard-segment'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import { PERFORMANCE_METRIC_OPTIONS } from '@/utils/parsers'
import type {
  AnalyticsAccountPerformanceRankBy,
  AnalyticsRange,
  SocialProvider,
} from '@socialista/types'

export type AccountPerformanceMetricToggleProps = {
  rankBy: AnalyticsAccountPerformanceRankBy
  range: AnalyticsRange
  provider?: SocialProvider | 'all'
  className?: string
}

function buildHref(
  rankBy: AnalyticsAccountPerformanceRankBy,
  range: AnalyticsRange,
  provider?: SocialProvider | 'all',
) {
  const search = new URLSearchParams({ range })
  if (rankBy !== 'followerGrowth') search.set('rankBy', rankBy)
  if (provider && provider !== 'all') search.set('provider', provider)
  return `${DASHBOARD_ROUTES.ROOT}?${search.toString()}`
}

function AccountPerformanceMetricToggle({
  rankBy,
  range,
  provider = 'all',
  className,
}: AccountPerformanceMetricToggleProps) {
  return (
    <DashboardSegment className={cn(className)} label="Rank top movers by">
      {PERFORMANCE_METRIC_OPTIONS.map(option => {
        const active = rankBy === option.value
        return (
          <Link
            key={option.value}
            href={buildHref(option.value, range, provider)}
            role="tab"
            aria-selected={active}
            className={dashboardSegmentLinkClass(active)}
            scroll={false}
          >
            {option.label}
          </Link>
        )
      })}
    </DashboardSegment>
  )
}

export { AccountPerformanceMetricToggle }
