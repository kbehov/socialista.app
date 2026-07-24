'use client'

import { POST_STATUS_META } from '@/components/posts/post-meta'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { PostStatus } from '@socialista/types'

export function PostStatusBadge({
  status,
  className,
}: {
  status: PostStatus
  className?: string
}) {
  const meta = POST_STATUS_META[status]

  return (
    <Badge variant="outline" className={cn('gap-1.5 font-medium', meta.className, className)}>
      <span className={cn('size-1.5 rounded-full', meta.dotClassName)} aria-hidden />
      {meta.label}
    </Badge>
  )
}
