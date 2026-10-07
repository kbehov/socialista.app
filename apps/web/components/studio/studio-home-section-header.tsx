import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

type StudioHomeSectionHeaderProps = {
  title: string
  description?: string
  trailing?: ReactNode
  meta?: ReactNode
  className?: string
}

export function StudioHomeSectionHeader({
  title,
  description,
  trailing,
  meta,
  className,
}: StudioHomeSectionHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h2 className="text-[13px] font-medium leading-none tracking-[-0.011em] text-black/56 dark:text-white/56">
            {title}
          </h2>
          {meta}
        </div>
        {description ? (
          <p className="text-[13px] leading-snug tracking-[-0.01em] text-muted-foreground/75">{description}</p>
        ) : null}
      </div>
      {trailing ? <div className="flex shrink-0 flex-wrap items-center gap-2">{trailing}</div> : null}
    </div>
  )
}
