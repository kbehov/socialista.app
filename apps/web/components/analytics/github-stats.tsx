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
}: GithubStatsProps) {
  const hasMetrics = Boolean(metrics && metrics.length > 0)
  const metricCount = metrics?.length ?? 0
  const columns = (metricCount <= 3 ? 3 : metricCount <= 4 ? 4 : 6) as 2 | 3 | 4 | 6

  return (
    <AnalyticsSection
      title={title}
      description={compact ? undefined : description}
      action={action}
      className={cn(className)}
      contentClassName={cn('flex flex-col', compact && hasMetrics ? 'gap-3 p-0' : 'gap-3')}
    >
      {hasMetrics ? (
        <StatMetrics
          className={cn(compact && 'rounded-none border-0 border-b border-border/40', 'w-full', metricsClassName)}
          size="sm"
          columns={columns}
        >
          {metrics!.map((metric, index) => (
            <StatMetric key={index} {...metric} />
          ))}
        </StatMetrics>
      ) : null}

      <div className={cn('min-w-0', compact && hasMetrics ? 'px-4 pb-4' : undefined)}>
        <ActivityHeatmap {...heatmap} />
      </div>
    </AnalyticsSection>
  )
}

export { GithubStats }
