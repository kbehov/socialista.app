import { cn } from '@/lib/utils'

const defaultGridClassName =
  'grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8'

type MediaGridSkeletonProps = {
  count?: number
  className?: string
  itemClassName?: string
}

export function MediaGridSkeleton({ count = 16, className, itemClassName }: MediaGridSkeletonProps) {
  return (
    <div className={cn(defaultGridClassName, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton placeholders
          key={index}
          className={cn('aspect-square animate-pulse rounded-lg bg-muted', itemClassName)}
        />
      ))}
    </div>
  )
}
