import type { ReactNode } from 'react'

import { ActivityHeatmap, type ActivityHeatmapProps } from '@/components/analytics/activity-heatmap'
import { AnalyticsSection } from '@/components/analytics/analytics-section'
import { StatMetric, StatMetrics, type StatMetricProps } from '@/components/analytics/stat-metric'
import { cn } from '@/lib/utils'

export type GithubStatsProps = {
  title?: ReactNode
  description?: ReactNode
  metrics?: StatMetricProps[]
  heatmap: ActivityHeatmapProps
  className?: string
  metricsClassName?: string
  action?: ReactNode
  /** Tighter layout — hides section description; metrics sit flush under the header */
  compact?: boolean
  /** Highlight the primary metric value with brand accent (default: first metric). Set to -1 to disable. */
  accentMetricIndex?: number
}

/**
 * Activity surface: optional metric strip + contribution heatmap.
 */
function GithubStats({
  title = 'Publishing activity',
  description,
  metrics,
  heatmap,
  className,
  metricsClassName,
  action,
  compact = false,
  accentMetricIndex = 0,
}: GithubStatsProps) {
  const hasMetrics = Boolean(metrics && metrics.length > 0)
  const metricCount = metrics?.length ?? 0
  const columns = (metricCount <= 3 ? 3 : metricCount <= 4 ? 4 : 6) as 2 | 3 | 4 | 6
  const heatmapProps: ActivityHeatmapProps = {
    colorScheme: 'brand',
    ...heatmap,
  }

  return (
    <AnalyticsSection
      title={title}
      description={compact ? undefined : description}
      action={action}
      className={cn(className)}
      contentClassName={cn('flex flex-col gap-4', compact && hasMetrics ? 'gap-0 p-0' : undefined)}
    >
      {hasMetrics ? (
        <StatMetrics
          className={cn(
            compact &&
              'rounded-none border-0 border-b border-border/50 bg-muted/15 shadow-none',
            'w-full',
            metricsClassName,
          )}
          size="sm"
          columns={columns}
        >
          {metrics!.map((metric, index) => (
            <StatMetric
              key={index}
              {...metric}
              valueClassName={cn(
                metric.valueClassName,
                accentMetricIndex >= 0 &&
                  index === accentMetricIndex &&
                  'text-accent-orange',
              )}
            />
          ))}
        </StatMetrics>
      ) : null}

      <div className={cn('min-w-0', compact && hasMetrics ? 'px-4 pb-4' : undefined)}>
        <ActivityHeatmap {...heatmapProps} />
      </div>
    </AnalyticsSection>
  )
}

export { GithubStats }
