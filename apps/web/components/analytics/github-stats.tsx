import type { ReactNode } from 'react'

import { ActivityHeatmap, type ActivityHeatmapProps } from '@/components/analytics/activity-heatmap'
import { AnalyticsSection } from '@/components/analytics/analytics-section'
import { StatMetric, StatMetrics, type StatMetricProps } from '@/components/analytics/stat-metric'
import { cn } from '@/lib/utils'

export type GithubStatsProps = {
  /** Optional title shown above the heatmap */
  title?: ReactNode
  description?: ReactNode
  /** Summary metrics rendered above the heatmap */
  metrics?: StatMetricProps[]
  heatmap: ActivityHeatmapProps
  className?: string
  metricsClassName?: string
  action?: ReactNode
  /** Tighter layout — hides section description, reduces spacing */
  compact?: boolean
}

/**
 * GitHub-style activity surface: optional metric strip + contribution heatmap.
 *
 * Prefer composing `ActivityHeatmap` / `StatMetrics` directly when you need
 * a different layout; use this when you want the classic stacked pattern.
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
  const metricCount = metrics?.length ?? 0
  const columns = metricCount <= 3 ? 3 : metricCount <= 4 ? 4 : 6

  return (
    <AnalyticsSection
      title={title}
      description={compact ? undefined : description}
      action={action}
      className={cn(className)}
      contentClassName={cn('flex flex-col', compact ? 'gap-2' : 'gap-3')}
    >
      {metrics && metrics.length > 0 ? (
        <StatMetrics
          className={cn('w-full', metricsClassName)}
          size="sm"
          columns={columns as 2 | 3 | 4 | 6}
        >
          {metrics.map((metric, index) => (
            <StatMetric key={index} {...metric} />
          ))}
        </StatMetrics>
      ) : null}

      <ActivityHeatmap {...heatmap} />
    </AnalyticsSection>
  )
}

export { GithubStats }
