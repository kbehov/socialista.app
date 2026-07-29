import type { ReactNode } from 'react'

import { dashboardSurface } from '@/components/dashboard/surface'
import { cn } from '@/lib/utils'

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
        'flex flex-col items-center justify-center gap-1.5 px-4 py-6 text-center',
        dashboardSurface.insetDashed,
        minHeightClassName,
        className,
      )}
    >
      {icon ? (
        <span className="mb-1 flex size-8 items-center justify-center rounded-xl border border-border/50 bg-background text-muted-foreground shadow-xs">
          {icon}
        </span>
      ) : null}
      <p className="text-xs font-medium tracking-tight text-foreground">{title}</p>
      {description ? <p className="max-w-56 text-[11px] leading-relaxed text-muted-foreground">{description}</p> : null}
    </div>
  )
}

export { AnalyticsEmpty }
