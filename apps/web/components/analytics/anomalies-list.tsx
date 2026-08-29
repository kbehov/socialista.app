import { CheckCircle2Icon, TriangleAlertIcon } from 'lucide-react'

import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { cn } from '@/lib/utils'
import type { AnalyticsAnomaly } from '@socialista/types'

import { formatCount, formatPercent } from '@/utils/format'
import { AnalyticsEmpty } from './analytics-empty'
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
        <AnalyticsEmpty
          icon={<CheckCircle2Icon className="size-3.5 text-success" strokeWidth={1.75} />}
          title={error ? 'Anomalies unavailable' : 'All clear'}
          description={error ? 'Could not load anomaly detection for this range.' : 'No unusual spikes or drops in this range.'}
        />
      ) : (
        <ul className="flex flex-col">
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
    <li className="flex items-center gap-2.5 rounded-md px-1 py-1.5 -mx-1">
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center',
          isCritical ? 'text-destructive' : 'text-warning',
        )}
      >
        <TriangleAlertIcon className="size-3.5" strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className="text-[13px] font-medium text-foreground">
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
          'shrink-0 text-[11px] font-medium capitalize',
          isCritical ? 'text-destructive' : 'text-muted-foreground',
        )}
      >
        {anomaly.severity}
      </span>
    </li>
  )
}

export { AnomaliesList }
