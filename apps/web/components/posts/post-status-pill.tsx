'use client'

import { POST_STATUS_META } from '@/components/posts/post-meta'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { PostStatus } from '@socialista/types'
import { forwardRef } from 'react'

const StatusMark = forwardRef<
  HTMLSpanElement,
  { status: PostStatus; showLabel: 'auto' | 'always' }
>(function StatusMark({ status, showLabel }, ref) {
  const meta = POST_STATUS_META[status]

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5',
        'text-[11px] font-medium tracking-tight',
        meta.className,
      )}
      aria-label={meta.label}
    >
      <span className={cn('size-1.5 rounded-full', meta.dotClassName)} aria-hidden />
      <span className={cn(showLabel === 'always' ? 'inline' : 'hidden sm:inline')}>{meta.label}</span>
    </span>
  )
})

export function PostStatusPill({
  status,
  showLabel = 'auto',
}: {
  status: PostStatus
  showLabel?: 'auto' | 'always'
}) {
  if (showLabel === 'always') {
    return <StatusMark status={status} showLabel={showLabel} />
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <StatusMark status={status} showLabel={showLabel} />
      </TooltipTrigger>
      <TooltipContent side="top" className="sm:hidden">
        {POST_STATUS_META[status].label}
      </TooltipContent>
    </Tooltip>
  )
}
