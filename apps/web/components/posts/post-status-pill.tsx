'use client'

import { POST_STATUS_META } from '@/components/posts/post-meta'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { PostStatus } from '@socialista/types'

export function PostStatusPill({ status }: { status: PostStatus }) {
  const meta = POST_STATUS_META[status]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5',
            'text-[10px] font-medium tracking-tight',
            meta.className,
          )}
          aria-label={meta.label}
        >
          <span className={cn('size-1.5 rounded-full', meta.dotClassName)} aria-hidden />
          <span className="hidden sm:inline">{meta.label}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="sm:hidden">
        {meta.label}
      </TooltipContent>
    </Tooltip>
  )
}
