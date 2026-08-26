'use client'

import { usePageScrollCompact } from '@/components/headers/page-scroll-compact'
import { PostStatusCountsText } from '@/components/posts/post-status-counts-text'
import { dashboardSurface } from '@/components/dashboard/surface'
import {
  POST_DATE_RELATIVE_BADGE_LABEL,
  formatPostDateGroupHeading,
  getPostStatusCounts,
} from '@/lib/posts/post-display'
import { cn } from '@/lib/utils'
import { pluralizePosts } from '@/utils/post.utils'
import type { Post } from '@socialista/types'

type PostsDateHeadingProps = {
  date: Date
  posts: Post[]
  headingId: string
}

export function PostsDateHeading({ date, posts, headingId }: PostsDateHeadingProps) {
  const compact = usePageScrollCompact()
  const heading = formatPostDateGroupHeading(date)
  const statusCounts = getPostStatusCounts(posts)

  return (
    <header
      className={cn(
        'sticky top-0 z-10 -mx-3 px-3 sm:-mx-4 sm:px-4',
        'bg-background/85 backdrop-blur-xl backdrop-saturate-150',
        'supports-backdrop-filter:bg-background/70',
        compact ? 'pt-0.5 pb-2' : 'pt-1 pb-3',
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <h2 id={headingId} className={cn(dashboardSurface.sectionTitle, 'text-[15px]')}>
            {heading.label}
          </h2>
          {heading.relativeBadge ? (
            <span className="text-[12px] font-medium text-muted-foreground">
              {POST_DATE_RELATIVE_BADGE_LABEL[heading.relativeBadge]}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-[12px] leading-snug text-muted-foreground">
          <span className="tabular-nums tracking-tight">{pluralizePosts(posts.length)}</span>
          {Object.values(statusCounts).some(count => (count ?? 0) > 0) ? (
            <>
              <span aria-hidden> · </span>
              <PostStatusCountsText counts={statusCounts} className="text-[12px]" />
            </>
          ) : null}
        </p>
      </div>
    </header>
  )
}
