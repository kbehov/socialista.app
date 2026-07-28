import type { ReactNode } from 'react'

import { dashboardSurface } from '@/components/dashboard'
import { cn } from '@/lib/utils'

import type { TrendDirection } from './lib/format'

export type MetricCardTone = 'orange' | 'blue' | 'green' | 'purple' | 'amber' | 'sky' | 'neutral'

export type MetricCardProps = {
  label: ReactNode
  value: ReactNode
  description?: ReactNode
  icon?: ReactNode
  tone?: MetricCardTone
  trend?: {
    value: ReactNode
    direction?: TrendDirection
    label?: ReactNode
  }
  className?: string
}

const TREND_STYLES: Record<TrendDirection, string> = {
  up: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  down: 'bg-red-500/10 text-red-600 dark:text-red-400',
  neutral: 'bg-muted text-muted-foreground',
}

function MetricCard({ label, value, description, icon, trend, className }: MetricCardProps) {
  const direction = trend?.direction ?? 'neutral'

  return (
    <div
      data-slot="metric-card"
      className={cn(
        'flex min-w-0 flex-col gap-1.5 rounded-xl border border-border/60 bg-background px-3.5 py-3',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={cn(dashboardSurface.metricLabel, 'truncate')}>{label}</p>
        {icon ? <span className="shrink-0 text-muted-foreground/50 [&_svg]:size-3">{icon}</span> : null}
      </div>

      <div className="flex items-baseline gap-2">
        <p className={cn(dashboardSurface.metricValue, 'truncate')}>{value}</p>
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

export type MetricCardGridProps = {
  children: ReactNode
  className?: string
  columns?: 2 | 3 | 4 | 6
}

const COLUMN_STYLES = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 xl:grid-cols-4',
  6: 'sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6',
} as const

function MetricCardGrid({ children, className, columns = 4 }: MetricCardGridProps) {
  return (
    <div data-slot="metric-card-grid" className={cn('grid grid-cols-1 gap-2', COLUMN_STYLES[columns], className)}>
      {children}
    </div>
  )
}

export { MetricCard, MetricCardGrid }
