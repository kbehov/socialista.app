import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { AnalyticsSection } from './analytics-section'

export type AnalyticsSkeletonProps = {
  title: string
  description?: string
  className?: string
  heightClassName?: string
}

function AnalyticsSkeleton({ title, description, className, heightClassName = 'h-48' }: AnalyticsSkeletonProps) {
  return (
    <AnalyticsSection title={title} description={description} className={className}>
      <Skeleton className={cn('w-full rounded-md', heightClassName)} />
    </AnalyticsSection>
  )
}

export { AnalyticsSkeleton }
