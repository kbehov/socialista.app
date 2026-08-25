import Link from 'next/link'

import { DashboardSegment, dashboardSegmentLinkClass } from '@/components/dashboard/dashboard-segment'
import { cn } from '@/lib/utils'
import { buildAnalyticsDashboardHref } from '@/utils/analytics-href'
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
            href={buildAnalyticsDashboardHref({ range, rankBy: option.value, provider })}
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
