'use client'

import { Loader2Icon, PencilIcon, SendIcon, Trash2Icon } from 'lucide-react'
import type { ReactNode } from 'react'
import { memo } from 'react'

import { dashboardSurface } from '@/components/dashboard/surface'
import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { PreviewEmbedProvider } from '@/components/posts/composer/previews/preview-embed-context'
import { PlatformPreview } from '@/components/posts/composer/previews/preview-registry'
import { formatPostDateTime } from '@/components/posts/post-meta'
import { PostStatusPill } from '@/components/posts/post-status-pill'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { getPostCaption, getPostDisplayDate, postToComposerMedia } from '@/lib/posts/post-display'
import { cn } from '@/lib/utils'
import { isPostEditable } from '@/utils/composer.utils'
import { getClickableElementProps, stopPropagationClick } from '@/utils/dom-events'
import { formatRelativeTime } from '@/utils/format'
import { canDeletePost, canPostNow, getAccountDisplayName } from '@/utils/post.utils'
import type { AccountSummary, Post } from '@socialista/types'

export type PostPreviewCardProps = {
  post: Post
  account: AccountSummary
  onEdit?: (post: Post) => void
  onPostNow?: (post: Post) => void
  onDelete?: (post: Post) => void
  isPublishing?: boolean
}

const actionIconClassName = cn(
  'size-7 rounded-md text-muted-foreground',
  'opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-150',
  'sm:group-hover:opacity-100 sm:group-focus-within:opacity-100',
)

function CardActionButton({
  label,
  tooltip,
  className,
  onClick,
  children,
}: {
  label: string
  tooltip: string
  className?: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(actionIconClassName, className)}
          aria-label={label}
          onClick={stopPropagationClick(onClick)}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{tooltip}</TooltipContent>
    </Tooltip>
  )
}

function PostCardFooter({
  post,
  accountLabel,
  displayDate,
  editable,
  showDelete,
  showPostNow,
  isPublishing,
  onEdit,
  onDelete,
  onPostNow,
}: {
  post: Post
  accountLabel: string
  displayDate: Date
  editable: boolean
  showDelete: boolean
  showPostNow: boolean
  isPublishing: boolean
  onEdit?: () => void
  onDelete?: () => void
  onPostNow?: () => void
}) {
  return (
    <footer className="flex items-center justify-between gap-2 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <SocialPlatformIcon provider={post.provider} size={11} className="size-5 shrink-0" />
        <p className="truncate text-[12px] font-medium tracking-tight text-muted-foreground">{accountLabel}</p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
        {showPostNow && onPostNow ? (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={isPublishing}
            className="h-7 gap-1 px-2 text-[11px] font-medium text-foreground"
            onClick={stopPropagationClick(onPostNow)}
          >
            {isPublishing ? (
              <Loader2Icon className="size-3.5 animate-spin" strokeWidth={1.75} />
            ) : (
              <SendIcon className="size-3.5" strokeWidth={1.75} />
            )}
            {isPublishing ? 'Publishing…' : 'Post now'}
          </Button>
        ) : null}

        {editable && onEdit ? (
          <CardActionButton label="Edit post" tooltip="Edit" className="hover:text-foreground" onClick={onEdit}>
            <PencilIcon className="size-3.5" strokeWidth={1.75} />
          </CardActionButton>
        ) : null}

        {showDelete && onDelete ? (
          <CardActionButton
            label="Delete post"
            tooltip="Delete"
            className="hover:bg-destructive/10 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2Icon className="size-3.5" strokeWidth={1.75} />
          </CardActionButton>
        ) : null}

        <div className="ml-1 flex items-center gap-1.5">
          <PostStatusPill status={post.status} />
          <Tooltip>
            <TooltipTrigger asChild>
              <time
                dateTime={displayDate.toISOString()}
                className="cursor-default text-[12px] tabular-nums tracking-tight text-muted-foreground"
              >
                {formatRelativeTime(displayDate)}
              </time>
            </TooltipTrigger>
            <TooltipContent side="top">{formatPostDateTime(displayDate)}</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </footer>
  )
}

export const PostPreviewCard = memo(function PostPreviewCard({
  post,
  account,
  onEdit,
  onPostNow,
  onDelete,
  isPublishing = false,
}: PostPreviewCardProps) {
  const media = postToComposerMedia(post)
  const caption = getPostCaption(post)
  const description = post.description ?? ''
  const displayDate = getPostDisplayDate(post)
  const accountLabel = getAccountDisplayName(account)
  const editable = isPostEditable(post.status)
  const isClickable = editable && Boolean(onEdit)
  const showPostNow = canPostNow(post.status) && Boolean(onPostNow)
  const showDelete = Boolean(onDelete) && canDeletePost(post.status)
  const openEditor = onEdit ? () => onEdit(post) : undefined

  return (
    <article
      className={cn(
        dashboardSurface.section,
        'group mb-4 break-inside-avoid bg-card',
        'transition-colors duration-150',
        'hover:border-border/80 dark:hover:border-border',
        isClickable && 'cursor-pointer',
      )}
      {...getClickableElementProps(isClickable ? openEditor : undefined)}
    >
      <PreviewEmbedProvider embedded>
        <PlatformPreview
          provider={post.provider}
          account={account}
          caption={caption}
          description={description}
          media={media}
          postType={post.type}
          locationName={post.location?.name}
        />
      </PreviewEmbedProvider>

      {post.failureReason || post.firstCommentError ? (
        <div className="space-y-1 px-3 py-2">
          {post.failureReason ? (
            <p className="text-[12px] leading-snug text-destructive">{post.failureReason}</p>
          ) : null}
          {post.firstCommentError ? (
            <p className="text-[12px] leading-snug text-amber-700 dark:text-amber-400">
              First comment failed: {post.firstCommentError}
            </p>
          ) : null}
        </div>
      ) : null}

      <PostCardFooter
        post={post}
        accountLabel={accountLabel}
        displayDate={displayDate}
        editable={editable}
        showDelete={showDelete}
        showPostNow={showPostNow}
        isPublishing={isPublishing}
        onEdit={openEditor}
        onDelete={onDelete ? () => onDelete(post) : undefined}
        onPostNow={onPostNow ? () => onPostNow(post) : undefined}
      />
    </article>
  )
})
