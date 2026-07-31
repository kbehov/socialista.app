'use client'

import { Loader2Icon, PencilIcon, SendIcon, Trash2Icon } from 'lucide-react'
import type { ReactNode } from 'react'
import { memo } from 'react'

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
  'size-7 rounded-lg text-muted-foreground',
  'opacity-100 sm:opacity-0 sm:transition-opacity',
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

function PostNowBar({ isPublishing, onPostNow }: { isPublishing: boolean; onPostNow: () => void }) {
  return (
    <div className="border-t border-border/40 bg-muted/15 px-2.5 py-2 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="h-7 w-full gap-1.5 rounded-lg text-[11px] font-medium shadow-none"
        disabled={isPublishing}
        onClick={stopPropagationClick(onPostNow)}
      >
        {isPublishing ? (
          <Loader2Icon className="size-3.5 animate-spin" strokeWidth={1.75} />
        ) : (
          <SendIcon className="size-3.5" strokeWidth={1.75} />
        )}
        {isPublishing ? 'Publishing…' : 'Post now'}
      </Button>
    </div>
  )
}

function PostCardFooter({
  post,
  accountLabel,
  displayDate,
  editable,
  showDelete,
  onEdit,
  onDelete,
}: {
  post: Post
  accountLabel: string
  displayDate: Date
  editable: boolean
  showDelete: boolean
  onEdit?: () => void
  onDelete?: () => void
}) {
  return (
    <footer className="flex items-center justify-between gap-2.5 border-t border-border/40 bg-muted/15 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <SocialPlatformIcon provider={post.provider} size={11} className="size-5 shrink-0" />
        <p className="truncate text-[11px] font-medium tracking-tight text-muted-foreground">{accountLabel}</p>
      </div>

      <div className="flex shrink-0 items-center gap-0.5">
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
                className="cursor-default text-[11px] tabular-nums tracking-tight text-muted-foreground/80"
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
        'group mb-4 break-inside-avoid overflow-hidden rounded-2xl',
        'border border-border/50 bg-background',
        'shadow-[0_1px_2px_rgba(0,0,0,0.03)]',
        'transition-[border-color,box-shadow,transform] duration-200',
        'hover:border-border/80 hover:shadow-[0_4px_16px_rgba(0,0,0,0.05)]',
        'active:scale-[0.995] motion-reduce:active:scale-100',
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
        <div className="space-y-1 border-t border-border/40 bg-destructive/5 px-3 py-2">
          {post.failureReason ? (
            <p className="text-[11px] leading-snug text-destructive">{post.failureReason}</p>
          ) : null}
          {post.firstCommentError ? (
            <p className="text-[11px] leading-snug text-amber-700 dark:text-amber-400">
              First comment failed: {post.firstCommentError}
            </p>
          ) : null}
        </div>
      ) : null}

      {showPostNow && onPostNow ? <PostNowBar isPublishing={isPublishing} onPostNow={() => onPostNow(post)} /> : null}

      <PostCardFooter
        post={post}
        accountLabel={accountLabel}
        displayDate={displayDate}
        editable={editable}
        showDelete={showDelete}
        onEdit={openEditor}
        onDelete={onDelete ? () => onDelete(post) : undefined}
      />
    </article>
  )
})
