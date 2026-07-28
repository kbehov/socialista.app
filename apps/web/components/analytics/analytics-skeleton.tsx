import { dashboardSurface } from '@/components/dashboard/surface'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { AnalyticsSection } from './analytics-section'
import { UsageStatsGrid } from './panels/usage-stats-panel'

export type AnalyticsSkeletonProps = {
  title: string
  description?: string
  className?: string
  heightClassName?: string
}

function AnalyticsSkeleton({ title, description, className, heightClassName = 'h-48' }: AnalyticsSkeletonProps) {
  return (
    <AnalyticsSection title={title} description={description} className={className}>
      <Skeleton className={cn('w-full rounded-lg', heightClassName)} />
    </AnalyticsSection>
  )
}

function MetricCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <UsageStatsGrid>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={cn('flex flex-col gap-2.5 px-4 py-3.5', dashboardSurface.dividerCell)}>
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3 w-14" />
            <Skeleton className="size-3.5 rounded-sm" />
          </div>
          <Skeleton className="h-5 w-24" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-1 w-full rounded-full" />
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-7" />
            </div>
          </div>
        </div>
      ))}
    </UsageStatsGrid>
  )
}

export { AnalyticsSkeleton, MetricCardsSkeleton }
