'use client'

import { getSocialPlatformLabel, SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { PostActionsMenu } from '@/components/posts/post-actions-menu'
import { PostStatusBadge } from '@/components/posts/post-status-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { dashboardSurface } from '@/components/dashboard/surface'
import { POST_TYPE_LABELS, getPostDisplayDate, getPostPreviewText, getPostThumbnail } from '@/lib/posts/post-display'
import { cn } from '@/lib/utils'
import { isPostEditable } from '@/utils/composer.utils'
import { formatAbsoluteDate, formatRelativeTime } from '@/utils/format'
import { getAccountDisplayName } from '@/utils/post.utils'
import type { AccountSummary, Post } from '@socialista/types'
import { FileTextIcon, ImageIcon, ImagesIcon, VideoIcon } from 'lucide-react'

type PostGridCardProps = {
  post: Post
  account: AccountSummary
  onEdit?: (post: Post) => void
  onPostNow?: (post: Post) => void
  onDelete?: (post: Post) => void
  isPublishing?: boolean
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
    <span className="flex size-full items-center justify-center bg-foreground/[0.04] text-foreground/44">
      {post.type === 'text' ? (
        <FileTextIcon className="size-8" strokeWidth={1.5} />
      ) : post.type === 'carousel' ? (
        <ImagesIcon className="size-8" strokeWidth={1.5} />
      ) : post.type === 'video' || post.type === 'reel' ? (
        <VideoIcon className="size-8" strokeWidth={1.5} />
      ) : (
        <ImageIcon className="size-8" strokeWidth={1.5} />
      )}
    </span>
  )
}

export function PostGridCard({
  post,
  account,
  onEdit,
  onPostNow,
  onDelete,
  isPublishing = false,
}: PostGridCardProps) {
  const title = getPostPreviewText(post)
  const platformLabel = getSocialPlatformLabel(post.provider)
  const typeLabel = POST_TYPE_LABELS[post.type]
  const accountLabel = getAccountDisplayName(account)
  const displayDate = getPostDisplayDate(post)
  const editable = Boolean(onEdit) && isPostEditable(post.status)
  const statusHint = post.failureReason || post.firstCommentError

  return (
    <article
      className={cn(
        dashboardSurface.section,
        'group flex flex-col overflow-hidden transition-colors duration-150 ease-out hover:bg-muted/30',
        editable && 'cursor-pointer',
      )}
      onClick={editable && onEdit ? () => onEdit(post) : undefined}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-border/50 bg-foreground/[0.02]">
        <PostThumb post={post} />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
          {statusHint ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <PostStatusBadge status={post.status} />
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-60">
                {statusHint}
              </TooltipContent>
            </Tooltip>
          ) : (
            <PostStatusBadge status={post.status} />
          )}
          <PostActionsMenu
            post={post}
            isPublishing={isPublishing}
            onEdit={onEdit}
            onPostNow={onPostNow}
            onDelete={onDelete}
            triggerClassName="bg-background/80 backdrop-blur-sm"
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        <p className="line-clamp-2 text-[13px] font-medium leading-snug tracking-[-0.01em] text-foreground">
          {title}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-foreground/56">
          <span className="inline-flex min-w-0 items-center gap-1">
            <SocialPlatformIcon provider={post.provider} size={12} framed={false} className="size-3 shrink-0" />
            <span className="truncate">{platformLabel}</span>
          </span>
          <span aria-hidden className="text-border">·</span>
          <span className="truncate">{typeLabel}</span>
          <span aria-hidden className="hidden text-border sm:inline">·</span>
          <span className="hidden truncate sm:inline">{accountLabel}</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <time
              dateTime={displayDate.toISOString()}
              className="text-[11px] tabular-nums text-foreground/48"
            >
              {formatRelativeTime(displayDate)}
            </time>
          </TooltipTrigger>
          <TooltipContent side="top">{formatAbsoluteDate(displayDate)}</TooltipContent>
        </Tooltip>
      </div>
    </article>
  )
}
