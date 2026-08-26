'use client'

import { getActiveStatusSummary, type PostStatusSummaryItem } from '@/components/posts/post-meta'
import { cn } from '@/lib/utils'
import type { PostStatus } from '@socialista/types'

type PostStatusCountsTextProps = {
  counts: Partial<Record<PostStatus, number>>
  summary?: PostStatusSummaryItem[]
  className?: string
}

export function PostStatusCountsText({
  counts,
  summary,
  className,
}: PostStatusCountsTextProps) {
  const activeStatuses = getActiveStatusSummary(counts, summary)
  if (activeStatuses.length === 0) return null

  return (
    <span className={cn('text-[12px] tracking-tight text-muted-foreground', className)}>
      {activeStatuses.map(({ status, label, className: statusClassName, value }, index) => (
        <span key={status}>
          {index > 0 ? <span aria-hidden> · </span> : null}
          <span className={cn('font-medium tabular-nums', statusClassName)}>{value}</span> {label}
        </span>
      ))}
    </span>
  )
}
