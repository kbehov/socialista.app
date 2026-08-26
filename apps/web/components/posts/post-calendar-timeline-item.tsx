'use client'

import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { POST_STATUS_META } from '@/components/posts/post-meta'
import { PostStatusPill } from '@/components/posts/post-status-pill'
import { getPostDisplayDate, getPostPreviewText, getPostThumbnail } from '@/lib/posts/post-display'
import { cn } from '@/lib/utils'
import { formatPostTime } from '@/utils/format'
import type { AccountSummary, Post } from '@socialista/types'
import { FileTextIcon, ImageIcon, VideoIcon } from 'lucide-react'

type PostCalendarTimelineItemProps = {
  post: Post
  account?: AccountSummary
  isLast?: boolean
  className?: string
}

function PostThumb({ post }: { post: Post }) {
  const thumbnail = getPostThumbnail(post)

  if (thumbnail) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote media URLs vary by platform
      <img src={thumbnail} alt="" className="size-full object-cover" />
    )
  }

  return (
    <span className="flex size-full items-center justify-center text-muted-foreground">
      {post.type === 'text' ? (
        <FileTextIcon className="size-3.5" strokeWidth={1.75} />
      ) : post.type === 'video' || post.type === 'reel' ? (
        <VideoIcon className="size-3.5" strokeWidth={1.75} />
      ) : (
        <ImageIcon className="size-3.5" strokeWidth={1.75} />
      )}
    </span>
  )
}

export function PostCalendarTimelineItem({ post, account, isLast = false, className }: PostCalendarTimelineItemProps) {
  const displayDate = getPostDisplayDate(post)
  const title = getPostPreviewText(post)
  const accountLabel = account?.accountName || account?.username || 'Account'
  const statusMeta = POST_STATUS_META[post.status]

  return (
    <article className={cn('relative flex gap-3', className)}>
      <div className="flex w-12 shrink-0 flex-col items-end pt-0.5 sm:w-14">
        <time dateTime={displayDate.toISOString()} className="text-[12px] font-medium tabular-nums text-foreground">
          {formatPostTime(displayDate)}
        </time>
      </div>

      <div className={cn('relative flex min-w-0 flex-1 gap-3', isLast ? 'pb-0' : 'pb-5')}>
        <div className="relative flex flex-col items-center">
          <span
            className={cn('mt-1.5 size-2 shrink-0 rounded-full ring-2 ring-background', statusMeta.dotClassName)}
            aria-hidden
          />
          {isLast ? null : <span aria-hidden className="absolute top-4 bottom-0 w-px bg-border/70" />}
        </div>

        <div className="min-w-0 flex-1 rounded-lg px-1 py-0.5 transition-colors duration-150 hover:bg-muted/30">
          <div className="flex gap-2.5">
            <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-muted">
              <PostThumb post={post} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[13px] leading-snug font-medium tracking-[-0.01em] text-foreground">
                {title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[12px] text-muted-foreground">
                <SocialPlatformIcon provider={post.provider} size={10} framed={false} className="size-3" />
                <span className="truncate font-medium tracking-tight">{accountLabel}</span>
                <span aria-hidden className="text-border">
                  ·
                </span>
                <span>{getSocialPlatformLabel(post.provider)}</span>
              </div>
              <div className="mt-1.5">
                <PostStatusPill status={post.status} showLabel="always" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
