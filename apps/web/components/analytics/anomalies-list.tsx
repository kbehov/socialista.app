import { TriangleAlertIcon } from 'lucide-react'

import { dashboardSurface } from '@/components/dashboard/surface'
import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { cn } from '@/lib/utils'
import type { AnalyticsAnomaly } from '@socialista/types'

import { formatCount, formatPercent } from '@/utils/format'
import { AnalyticsSection } from './analytics-section'

export type AnomaliesListProps = {
  anomalies: AnalyticsAnomaly[]
  className?: string
  limit?: number
  error?: string
}

function AnomaliesList({ anomalies, className, limit = 8, error }: AnomaliesListProps) {
  const visible = anomalies.slice(0, limit)

  return (
    <AnalyticsSection
      className={cn(className)}
      title="Anomalies"
      description="Spike and drop detection vs. 7-day baseline."
    >
      {error ? <p className="mb-3 text-xs text-destructive">{error}</p> : null}

      {visible.length === 0 ? (
        <div className={cn('flex min-h-28 items-center justify-center', dashboardSurface.insetDashed)}>
          <p className="text-xs text-muted-foreground">
            {error ? 'Anomalies unavailable.' : 'No anomalies in this range.'}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {visible.map((anomaly, index) => (
            <AnomalyRow
              key={`${anomaly.metric}-${anomaly.provider ?? 'all'}-${anomaly.date}-${index}`}
              anomaly={anomaly}
            />
          ))}
        </ul>
      )}
    </AnalyticsSection>
  )
}

function AnomalyRow({ anomaly }: { anomaly: AnalyticsAnomaly }) {
  const isCritical = anomaly.severity === 'critical'

  return (
    <li className={cn('flex items-center gap-3 px-3 py-2.5', dashboardSurface.inset)}>
      <span
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-md',
          isCritical
            ? 'bg-red-500/10 text-red-600 dark:text-red-400'
            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        )}
      >
        <TriangleAlertIcon className="size-3.5" strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className="text-xs font-medium text-foreground">
            {anomaly.direction === 'spike' ? 'Spike' : 'Drop'} in {anomaly.metric}
          </p>
          {anomaly.provider ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
              <SocialPlatformIcon provider={anomaly.provider} size={10} className="size-3.5 rounded [&_svg]:size-2" />
              {getSocialPlatformLabel(anomaly.provider)}
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground">Workspace</span>
          )}
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          {anomaly.date} · {formatPercent(anomaly.changePercent)} · {formatCount(anomaly.baseline)} →{' '}
          {formatCount(anomaly.value)}
        </p>
      </div>

      <span
        className={cn(
          'shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-medium capitalize',
          isCritical ? 'bg-red-500/10 text-red-600 dark:text-red-400' : 'bg-muted text-muted-foreground',
        )}
      >
        {anomaly.severity}
      </span>
    </li>
  )
}

export { AnomaliesList }
