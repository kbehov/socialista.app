'use client'

import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { POST_STATUS_META } from '@/components/posts/post-meta'
import { getPostDisplayDate, getPostPreviewText, getPostThumbnail } from '@/lib/post-display'
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
        <FileTextIcon className="size-3.5 opacity-70" strokeWidth={1.75} />
      ) : post.type === 'video' || post.type === 'reel' ? (
        <VideoIcon className="size-3.5 opacity-70" strokeWidth={1.75} />
      ) : (
        <ImageIcon className="size-3.5 opacity-70" strokeWidth={1.75} />
      )}
    </span>
  )
}

export function PostCalendarTimelineItem({
  post,
  account,
  isLast = false,
  className,
}: PostCalendarTimelineItemProps) {
  const displayDate = getPostDisplayDate(post)
  const title = getPostPreviewText(post)
  const accountLabel = account?.accountName || account?.username || 'Account'
  const statusMeta = POST_STATUS_META[post.status]

  return (
    <article className={cn('relative flex gap-3', className)}>
      <div className="flex w-14 shrink-0 flex-col items-end pt-0.5">
        <time
          dateTime={displayDate.toISOString()}
          className="text-[11px] font-medium tabular-nums text-foreground"
        >
          {formatPostTime(displayDate)}
        </time>
      </div>

      <div className="relative flex min-w-0 flex-1 gap-3 pb-4">
        <div className="relative flex flex-col items-center">
          <span
            className={cn('mt-1.5 size-2 shrink-0 rounded-full ring-2 ring-background', statusMeta.dotClassName)}
            aria-hidden
          />
          {!isLast ? (
            <span aria-hidden className="absolute top-4 bottom-0 w-px bg-border/70" />
          ) : null}
        </div>

        <div className="min-w-0 flex-1 rounded-xl border border-border/45 bg-background p-2.5 transition-[border-color,background-color,box-shadow] duration-150 hover:border-border/70 hover:bg-muted/20 hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex gap-2.5">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/40">
              <PostThumb post={post} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-[13px] leading-snug font-medium tracking-[-0.01em] text-foreground">
                {title}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-muted-foreground">
                <SocialPlatformIcon provider={post.provider} size={10} framed={false} className="size-3" />
                <span className="truncate font-medium tracking-tight">{accountLabel}</span>
                <span aria-hidden className="text-border">
                  ·
                </span>
                <span>{getSocialPlatformLabel(post.provider)}</span>
              </div>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-1.5 border-t border-border/35 pt-2">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium tracking-tight',
                statusMeta.className,
              )}
            >
              <span className={cn('size-1.5 rounded-full', statusMeta.dotClassName)} aria-hidden />
              {statusMeta.label}
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
