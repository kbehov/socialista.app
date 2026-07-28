import { dashboardSurface } from '@/components/dashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { AnalyticsSection } from './analytics-section'

export type AnalyticsSkeletonProps = {
  title: string
  description?: string
  className?: string
  heightClassName?: string
}

function AnalyticsSkeleton({
  title,
  description,
  className,
  heightClassName = 'h-48',
}: AnalyticsSkeletonProps) {
  return (
    <AnalyticsSection title={title} description={description} className={className}>
      <Skeleton className={cn('w-full rounded-lg', heightClassName)} />
    </AnalyticsSection>
  )
}

function MetricCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={cn(dashboardSurface.dividerGrid, 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4')}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={cn('flex flex-col gap-2 px-3.5 py-3', dashboardSurface.dividerCell)}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-2.5 w-12" />
        </div>
      ))}
    </div>
  )
}

export { AnalyticsSkeleton, MetricCardsSkeleton }
