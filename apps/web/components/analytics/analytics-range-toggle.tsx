import Link from 'next/link'

import { dashboardSegmentLinkClass, DashboardSegment } from '@/components/dashboard'
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
  params?: Record<string, string | undefined>
  className?: string
}

function buildHref(range: AnalyticsRange, params?: Record<string, string | undefined>) {
  const search = new URLSearchParams()
  search.set('range', range)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) search.set(key, value)
    }
  }
  return `${DASHBOARD_ROUTES.ROOT}?${search.toString()}`
}

function AnalyticsRangeToggle({ range, params, className }: AnalyticsRangeToggleProps) {
  return (
    <DashboardSegment className={cn(className)} label="Analytics time range">
      {RANGE_OPTIONS.map(option => {
        const active = range === option.value
        return (
          <Link
            key={option.value}
            href={buildHref(option.value, params)}
            role="tab"
            aria-selected={active}
            className={dashboardSegmentLinkClass(active, 'px-2.5 py-1')}
          >
            {option.label}
          </Link>
        )
      })}
    </DashboardSegment>
  )
}

export { AnalyticsRangeToggle }
