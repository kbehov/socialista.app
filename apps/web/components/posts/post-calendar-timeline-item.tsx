'use client'

import { getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { PostActionsMenu } from '@/components/posts/post-actions-menu'
import { PostStatusBadge } from '@/components/posts/post-status-badge'
import { POST_TYPE_LABELS, getPostDisplayDate, getPostPreviewText, getPostThumbnail } from '@/lib/posts/post-display'
import { cn } from '@/lib/utils'
import { isPostEditable } from '@/utils/composer.utils'
import { formatPostTime } from '@/utils/format'
import { getAccountDisplayName } from '@/utils/post.utils'
import type { AccountSummary, Post } from '@socialista/types'
import { FileTextIcon, ImageIcon, ImagesIcon, VideoIcon } from 'lucide-react'

type PostCalendarTimelineItemProps = {
  post: Post
  account?: AccountSummary
  onEdit?: (post: Post) => void
  onPostNow?: (post: Post) => void
  onDelete?: (post: Post) => void
  isPublishing?: boolean
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
    <span className="flex size-full items-center justify-center text-foreground/44">
      {post.type === 'text' ? (
        <FileTextIcon className="size-3.5" strokeWidth={1.5} />
      ) : post.type === 'carousel' ? (
        <ImagesIcon className="size-3.5" strokeWidth={1.5} />
      ) : post.type === 'video' || post.type === 'reel' ? (
        <VideoIcon className="size-3.5" strokeWidth={1.5} />
      ) : (
        <ImageIcon className="size-3.5" strokeWidth={1.5} />
      )}
    </span>
  )
}

export function PostCalendarTimelineItem({
  post,
  account,
  onEdit,
  onPostNow,
  onDelete,
  isPublishing = false,
  className,
}: PostCalendarTimelineItemProps) {
  const displayDate = getPostDisplayDate(post)
  const title = getPostPreviewText(post)
  const accountLabel = account ? getAccountDisplayName(account) : 'Account'
  const platformLabel = getSocialPlatformLabel(post.provider)
  const typeLabel = POST_TYPE_LABELS[post.type]
  const editable = Boolean(onEdit) && isPostEditable(post.status)

  return (
    <article
      className={cn(
        'group transition-colors duration-150 ease-out hover:bg-muted',
        editable && 'cursor-pointer',
        className,
      )}
      onClick={editable && onEdit ? () => onEdit(post) : undefined}
    >
      <div className="flex items-center gap-3 py-2">
        <time
          dateTime={displayDate.toISOString()}
          className="w-14 shrink-0 text-[13px] font-medium tabular-nums tracking-tight text-foreground"
        >
          {formatPostTime(displayDate)}
        </time>

        <div className="relative size-9 shrink-0 overflow-hidden rounded-md bg-foreground/[0.04]">
          <PostThumb post={post} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium leading-tight tracking-[-0.01em] text-foreground">{title}</p>
          <p className="mt-0.5 truncate text-[11px] leading-tight text-foreground/56">
            {accountLabel}
            <span aria-hidden> · </span>
            {platformLabel}
            <span aria-hidden> · </span>
            {typeLabel}
          </p>
        </div>

        <div className="hidden shrink-0 sm:block">
          <PostStatusBadge status={post.status} />
        </div>

        <div className="flex shrink-0 justify-end">
          <PostActionsMenu
            post={post}
            isPublishing={isPublishing}
            onEdit={onEdit}
            onPostNow={onPostNow}
            onDelete={onDelete}
          />
        </div>
      </div>
    </article>
  )
}
