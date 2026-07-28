import Link from 'next/link'

import { DashboardSegment, dashboardSegmentLinkClass } from '@/components/dashboard/dashboard-segment'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import type { AnalyticsRange } from '@socialista/types'

const RANGE_OPTIONS = [
  { value: 'daily' as const, label: '24h' },
  { value: 'weekly' as const, label: '7d' },
  { value: 'monthly' as const, label: '30d' },
]

export type AnalyticsRangeToggleProps = {
  range: AnalyticsRange
  /** Path the range links navigate to. Defaults to workspace dashboard root. */
  basePath?: string
  params?: Record<string, string | undefined>
  className?: string
}

function buildHref(range: AnalyticsRange, basePath: string, params?: Record<string, string | undefined>) {
  const search = new URLSearchParams()
  search.set('range', range)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value)
    }
  }
  return `${basePath}?${search.toString()}`
}

function AnalyticsRangeToggle({
  range,
  basePath = DASHBOARD_ROUTES.ROOT,
  params,
  className,
}: AnalyticsRangeToggleProps) {
  return (
    <DashboardSegment className={cn(className)} label="Analytics time range">
      {RANGE_OPTIONS.map(option => {
        const active = range === option.value
        return (
          <Link
            key={option.value}
            href={buildHref(option.value, basePath, params)}
            role="tab"
            aria-selected={active}
            className={dashboardSegmentLinkClass(active)}
          >
            {option.label}
          </Link>
        )
      })}
    </DashboardSegment>
  )
}

export { AnalyticsRangeToggle }
