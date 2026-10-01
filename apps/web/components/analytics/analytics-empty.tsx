import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import { analyticsSurface } from '@/components/analytics/analytics-surface'

export type AnalyticsEmptyProps = {
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  className?: string
  minHeightClassName?: string
}

/** Soft empty / zero-data state for analytics panels. */
function AnalyticsEmpty({
  title = 'Nothing to show',
  description,
  icon,
  className,
  minHeightClassName = 'min-h-28',
}: AnalyticsEmptyProps) {
  return (
    <div
      className={cn(
        'flex flex-col justify-center gap-1 px-0 py-3',
        minHeightClassName,
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            'mb-1 flex items-center justify-center text-muted-foreground',
            analyticsSurface.emptyIcon,
          )}
        >
          {icon}
        </span>
      ) : null}
      <p className="text-[13px] font-[510] text-foreground">{title}</p>
      {description ? (
        <p className="max-w-sm text-[11px] leading-relaxed text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

export { AnalyticsEmpty }
