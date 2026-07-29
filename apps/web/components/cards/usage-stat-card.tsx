import type { ReactNode } from 'react'

import { dashboardSurface } from '@/components/dashboard/surface'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatCount } from '@/utils/format'

export type UsageStatTone = 'sky' | 'violet' | 'emerald' | 'amber'

export type UsageStatCardProps = {
  title: string
  used: number
  remaining: number
  percentUsed: number
  limit?: number
  description?: string
  icon?: ReactNode
  iconClassName?: string
  tone?: UsageStatTone
  formatValue?: (value: number) => string
  className?: string
}

const TONE_STYLES: Record<UsageStatTone, { bar: string; track: string }> = {
  sky: { bar: 'bg-sky-500', track: 'bg-sky-500/15' },
  violet: { bar: 'bg-violet-500', track: 'bg-violet-500/15' },
  emerald: { bar: 'bg-emerald-500', track: 'bg-emerald-500/15' },
  amber: { bar: 'bg-amber-500', track: 'bg-amber-500/15' },
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(100, Math.max(0, value))
}

function UsageStatCard({
  title,
  used,
  remaining,
  percentUsed,
  limit,
  description,
  icon,
  iconClassName,
  tone = 'sky',
  formatValue = formatCount,
  className,
}: UsageStatCardProps) {
  const percent = clampPercent(percentUsed)
  const hasLimit = typeof limit === 'number' && limit > 0
  const isFull = hasLimit && percent >= 100
  const isNearFull = hasLimit && !isFull && percent >= 85
  const toneStyles = TONE_STYLES[tone]

  const barClassName = isFull ? 'bg-destructive' : isNearFull ? 'bg-amber-500' : toneStyles.bar
  const trackClassName = isFull ? 'bg-destructive/15' : isNearFull ? 'bg-amber-500/15' : toneStyles.track
  const statusClassName = isFull ? 'text-destructive' : isNearFull ? 'text-amber-600 dark:text-amber-400' : undefined
  const statusLabel = !hasLimit ? 'Unlimited' : isFull ? 'Limit reached' : `${formatValue(remaining)} remaining`

  return (
    <div
      data-slot="usage-stat-card"
      className={cn('flex min-w-0 flex-col gap-2.5 px-4 py-4', dashboardSurface.dividerCell, className)}
    >
      <div className="flex items-center justify-between gap-2">
        <p className={cn(dashboardSurface.metricLabel, 'truncate')}>{title}</p>
        {icon ? (
          <span
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground/50 [&_svg]:size-3.5',
              iconClassName,
            )}
          >
            {icon}
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 items-baseline gap-1.5">
        <p className={cn(dashboardSurface.metricValueSm, 'leading-none')}>{formatValue(used)}</p>
        {hasLimit ? (
          <p className="truncate text-[11px] font-medium tabular-nums text-muted-foreground">
            / {formatValue(limit)}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        {hasLimit ? (
          <Progress
            value={percent}
            className={cn('h-1 rounded-full', trackClassName)}
            indicatorClassName={cn('rounded-full', barClassName)}
            aria-label={`${title} usage: ${Math.round(percent)} percent`}
          />
        ) : (
          <div className="h-1 rounded-full bg-muted/60" role="presentation" aria-hidden />
        )}

        <div className="flex min-w-0 items-center justify-between gap-2">
          <p className={cn(dashboardSurface.metricDescription, 'tabular-nums', statusClassName)}>{statusLabel}</p>
          {hasLimit ? (
            <p
              className={cn(
                'shrink-0 text-[11px] font-medium tabular-nums',
                statusClassName ?? 'text-muted-foreground',
              )}
              aria-hidden
            >
              {Math.round(percent)}%
            </p>
          ) : null}
        </div>

        {description ? <p className={dashboardSurface.metricMeta}>{description}</p> : null}
      </div>
    </div>
  )
}

export { UsageStatCard }
