import { POST_STATUS_META } from '@/components/posts/post-meta'
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
    <span className={cn('inline-flex items-center gap-1.5 text-[13px] font-medium', meta.className, className)}>
      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dotClassName)} aria-hidden />
      {meta.label}
    </span>
  )
}
