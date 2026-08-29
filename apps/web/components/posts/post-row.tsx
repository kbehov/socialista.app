'use client'

import { getSocialPlatformLabel, SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { POST_STATUS_META } from '@/components/posts/post-meta'
import { PostActionsMenu } from '@/components/posts/post-actions-menu'
import { PostStatusBadge } from '@/components/posts/post-status-badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { POST_TYPE_LABELS, getPostDisplayDate, getPostPreviewText, getPostThumbnail } from '@/lib/posts/post-display'
import { cn } from '@/lib/utils'
import { isPostEditable } from '@/utils/composer.utils'
import { formatAbsoluteDate, formatRelativeTime } from '@/utils/format'
import { getAccountDisplayName } from '@/utils/post.utils'
import type { AccountSummary, Post } from '@socialista/types'
import { FileTextIcon, ImageIcon, ImagesIcon, VideoIcon } from 'lucide-react'

export const POST_ROW_GRID =
  'sm:grid sm:grid-cols-[minmax(0,1fr)_6.5rem_6.25rem_2rem] sm:items-center sm:gap-3 lg:grid-cols-[minmax(0,1fr)_6.5rem_6.25rem_4.75rem_5.5rem_2rem] xl:grid-cols-[minmax(0,1fr)_6.5rem_6.25rem_4.75rem_minmax(0,7.5rem)_5.5rem_2rem]'

type PostRowProps = {
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

export function PostRow({
  post,
  account,
  onEdit,
  onPostNow,
  onDelete,
  isPublishing = false,
}: PostRowProps) {
  const title = getPostPreviewText(post)
  const platformLabel = getSocialPlatformLabel(post.provider)
  const typeLabel = POST_TYPE_LABELS[post.type]
  const accountLabel = getAccountDisplayName(account)
  const displayDate = getPostDisplayDate(post)
  const editable = Boolean(onEdit) && isPostEditable(post.status)
  const statusHint = post.failureReason || post.firstCommentError
  const mobileMeta = [platformLabel, POST_STATUS_META[post.status].label, formatRelativeTime(displayDate)].join(
    ' · ',
  )

  return (
    <li
      className={cn(
        'group transition-colors duration-150 ease-out hover:bg-muted',
        editable && 'cursor-pointer',
      )}
      onClick={editable && onEdit ? () => onEdit(post) : undefined}
    >
      <div className={cn('flex items-center gap-3 py-2', POST_ROW_GRID)}>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="relative size-11 shrink-0 overflow-hidden rounded-md bg-foreground/[0.04]">
            <PostThumb post={post} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium leading-tight tracking-[-0.01em] text-foreground">{title}</p>
            <p className="mt-0.5 truncate text-[11px] leading-tight text-foreground/56 sm:hidden">{mobileMeta}</p>
          </div>
        </div>

        <div className="hidden min-w-0 sm:block">
          <span className="inline-flex min-w-0 items-center gap-1.5 text-[13px] text-foreground/56">
            <SocialPlatformIcon provider={post.provider} size={12} framed={false} className="size-3.5 shrink-0" />
            <span className="truncate">{platformLabel}</span>
          </span>
        </div>

        <div className="hidden sm:block">
          {statusHint ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <PostStatusBadge status={post.status} />
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-60">
                {statusHint}
              </TooltipContent>
            </Tooltip>
          ) : (
            <PostStatusBadge status={post.status} />
          )}
        </div>

        <div className="hidden min-w-0 lg:block">
          <span className="block truncate text-[13px] text-foreground/56">{typeLabel}</span>
        </div>

        <div className="hidden min-w-0 xl:block">
          <span className="block truncate text-[13px] text-foreground/56">{accountLabel}</span>
        </div>

        <div className="hidden lg:block">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-default text-[13px] tabular-nums text-foreground/56">
                {formatRelativeTime(displayDate)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">{formatAbsoluteDate(displayDate)}</TooltipContent>
          </Tooltip>
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
    </li>
  )
}
