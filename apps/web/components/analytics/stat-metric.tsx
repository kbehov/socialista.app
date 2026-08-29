import type { ReactNode } from 'react'

import { dashboardSurface } from '@/components/dashboard/surface'
import { cn } from '@/lib/utils'

import type { TrendDirection } from '@/utils/format'

export type StatMetricProps = {
  value: ReactNode
  label: ReactNode
  description?: ReactNode
  icon?: ReactNode
  iconClassName?: string
  trend?: {
    value: ReactNode
    direction?: TrendDirection
    label?: ReactNode
  }
  className?: string
}

export type StatMetricsProps = {
  children: ReactNode
  className?: string
  size?: 'sm' | 'default'
  columns?: 2 | 3 | 4 | 6
}

const TREND_STYLES: Record<TrendDirection, string> = {
  up: dashboardSurface.trendUp,
  down: dashboardSurface.trendDown,
  neutral: 'text-muted-foreground',
}

const COLUMN_STYLES = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  6: 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
} as const

function StatMetrics({ children, className, size = 'default', columns = 4 }: StatMetricsProps) {
  return (
    <div
      data-slot="stat-metrics"
      data-size={size}
      className={cn('group/metrics', dashboardSurface.dividerGrid, 'w-full grid-cols-1', COLUMN_STYLES[columns], className)}
    >
      {children}
    </div>
  )
}

function StatMetric({ value, label, description, trend, className }: StatMetricProps) {
  const direction = trend?.direction ?? 'neutral'

  return (
    <div
      data-slot="stat-metric"
      className={cn(
        'flex min-w-0 flex-col gap-1 px-3.5 py-3.5',
        dashboardSurface.dividerCell,
        'group-data-[size=sm]/metrics:gap-0.5 group-data-[size=sm]/metrics:px-3 group-data-[size=sm]/metrics:py-3',
        className,
      )}
    >
      <p className={cn(dashboardSurface.metricLabel, 'truncate')}>{label}</p>

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p
          className={cn(
            dashboardSurface.metricValue,
            'leading-none whitespace-nowrap group-data-[size=sm]/metrics:text-base',
          )}
        >
          {value}
        </p>
        {trend ? (
          <span
            className={cn(
              'inline-flex shrink-0 items-center text-[11px] font-medium tabular-nums',
              TREND_STYLES[direction],
            )}
          >
            {trend.value}
          </span>
        ) : null}
      </div>

      {description ? (
        <p className={dashboardSurface.metricDescription}>{description}</p>
      ) : trend?.label ? (
        <p className={dashboardSurface.metricDescription}>{trend.label}</p>
      ) : null}
    </div>
  )
}

export { StatMetric, StatMetrics }
