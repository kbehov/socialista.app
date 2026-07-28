import type { ReactNode } from 'react'

import { dashboardSurface } from '@/components/dashboard'
import { cn } from '@/lib/utils'

import type { TrendDirection } from './lib/format'

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
  up: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  down: 'bg-red-500/10 text-red-600 dark:text-red-400',
  neutral: 'bg-muted text-muted-foreground',
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
      className={cn(dashboardSurface.dividerGrid, 'w-full grid-cols-1', COLUMN_STYLES[columns], className)}
    >
      {children}
    </div>
  )
}

function StatMetric({ value, label, description, icon, iconClassName, trend, className }: StatMetricProps) {
  const direction = trend?.direction ?? 'neutral'

  return (
    <div
      data-slot="stat-metric"
      className={cn(
        'flex min-w-0 flex-col gap-1 px-3.5 py-3.5',
        dashboardSurface.dividerCell,
        'group-data-[size=sm]/stat-metrics:px-3 group-data-[size=sm]/stat-metrics:py-2.5',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={dashboardSurface.metricLabel}>{label}</p>
        {icon ? (
          <span className={cn('shrink-0 [&_svg]:size-3', iconClassName ?? 'text-muted-foreground/50')}>{icon}</span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <p
          className={cn(
            dashboardSurface.metricValue,
            'whitespace-nowrap group-data-[size=sm]/stat-metrics:text-lg',
          )}
        >
          {value}
        </p>
        {trend ? (
          <span
            className={cn(
              'inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums',
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
