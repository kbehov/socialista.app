'use client'

import { usePageScrollCompact } from '@/components/headers/page-scroll-compact'
import { PostStatusCountsText } from '@/components/posts/post-status-counts-text'
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
        'transition-[padding] duration-200 ease-out motion-reduce:transition-none',
        compact ? 'pt-0.5 pb-1.5' : 'pt-1 pb-3',
      )}
    >
      <div
        className={cn(
          'flex flex-wrap items-end justify-between gap-x-4',
          'transition-[gap] duration-200 ease-out motion-reduce:transition-none',
          compact ? 'gap-y-1' : 'gap-y-2',
        )}
      >
        <div className="min-w-0">
          <div className={cn('flex flex-wrap items-center', compact ? 'gap-1.5' : 'gap-2')}>
            <h2
              id={headingId}
              className={cn(
                'font-semibold tracking-[-0.02em] text-foreground',
                'transition-[font-size,line-height] duration-200 ease-out motion-reduce:transition-none',
                compact ? 'text-[13px] leading-snug' : 'text-[15px] leading-tight',
              )}
            >
              {heading.label}
            </h2>
            {heading.relativeBadge ? (
              <span
                className={cn(
                  'rounded-full font-semibold tracking-wide uppercase',
                  'transition-[padding,font-size] duration-200 ease-out motion-reduce:transition-none',
                  compact ? 'px-1.5 py-px text-[9px]' : 'px-2 py-0.5 text-[10px]',
                  heading.relativeBadge === 'today'
                    ? 'bg-foreground text-background'
                    : 'bg-muted/80 text-muted-foreground',
                )}
              >
                {POST_DATE_RELATIVE_BADGE_LABEL[heading.relativeBadge]}
              </span>
            ) : null}
          </div>
          {heading.subtitle ? (
            <p
              className={cn(
                'text-[11px] leading-snug text-muted-foreground',
                'transition-[margin,opacity,max-height] duration-200 ease-out motion-reduce:transition-none',
                compact ? 'pointer-events-none mt-0 max-h-0 overflow-hidden opacity-0' : 'mt-0.5 max-h-8 opacity-100',
              )}
            >
              {heading.subtitle}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
          <p
            className={cn(
              'font-medium tabular-nums tracking-tight text-muted-foreground',
              'transition-[font-size] duration-200 ease-out motion-reduce:transition-none',
              compact ? 'text-[10px]' : 'text-[11px]',
            )}
          >
            {pluralizePosts(posts.length)}
          </p>
          <PostStatusCountsText
            counts={statusCounts}
            className={cn(
              'max-w-[min(100%,16rem)] leading-snug text-muted-foreground/80',
              'transition-[opacity,max-height] duration-200 ease-out motion-reduce:transition-none',
              compact ? 'pointer-events-none max-h-0 overflow-hidden opacity-0' : 'max-h-8 opacity-100',
            )}
          />
        </div>
      </div>
      <div
        className={cn(
          'pointer-events-none h-px bg-linear-to-r from-transparent via-border/60 to-transparent',
          'transition-[margin] duration-200 ease-out motion-reduce:transition-none',
          compact ? 'mt-1.5' : 'mt-3',
        )}
        aria-hidden
      />
    </header>
  )
}
