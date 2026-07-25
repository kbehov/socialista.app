'use client'

import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { PreviewEmbedProvider } from '@/components/posts/composer/previews/preview-embed-context'
import { getPreviewComponent } from '@/components/posts/composer/previews/preview-registry'
import { POST_STATUS_META, formatPostDateTime } from '@/components/posts/post-meta'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  createFallbackAccount,
  formatPostDateGroupHeading,
  getPostCaption,
  getPostDisplayDate,
  getPostStatusCounts,
  getSortedDateKeys,
  groupPostsByDateKey,
  postToComposerMedia,
} from '@/lib/post-display'
import { cn } from '@/lib/utils'
import { isPostEditable } from '@/utils/composer.utils'
import { formatRelativeTime } from '@/utils/format'
import type { AccountSummary, Post, PostStatus } from '@socialista/types'
import { Loader2Icon, PencilIcon, SendIcon } from 'lucide-react'
import { memo, useMemo } from 'react'

type PostsGridProps = {
  posts: Post[]
  accountsById: Record<string, AccountSummary>
  onEditPost?: (post: Post) => void
  onPostNow?: (post: Post) => void
  publishingPostId?: string | null
  className?: string
}

function canPostNow(status: PostStatus): boolean {
  return status === 'draft' || status === 'scheduled'
}

const STATUS_SUMMARY: Array<{ status: PostStatus; label: string; className: string }> = [
  { status: 'scheduled', label: 'scheduled', className: 'text-sky-600 dark:text-sky-400' },
  { status: 'publishing', label: 'publishing', className: 'text-amber-600 dark:text-amber-400' },
  { status: 'published', label: 'published', className: 'text-emerald-600 dark:text-emerald-400' },
  { status: 'draft', label: 'drafts', className: 'text-muted-foreground' },
  { status: 'failed', label: 'failed', className: 'text-destructive' },
  { status: 'canceled', label: 'canceled', className: 'text-muted-foreground' },
]

const RELATIVE_BADGE_LABEL: Record<
  NonNullable<ReturnType<typeof formatPostDateGroupHeading>['relativeBadge']>,
  string
> = {
  today: 'Today',
  tomorrow: 'Tomorrow',
  yesterday: 'Yesterday',
}

function PostStatusIndicator({ status }: { status: PostStatus }) {
  const meta = POST_STATUS_META[status]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn('size-1.5 shrink-0 rounded-full', meta.dotClassName)}
          aria-label={meta.label}
        />
      </TooltipTrigger>
      <TooltipContent side="top">{meta.label}</TooltipContent>
    </Tooltip>
  )
}

const PostPreviewCard = memo(function PostPreviewCard({
  post,
  account,
  onEdit,
  onPostNow,
  isPublishing,
}: {
  post: Post
  account: AccountSummary
  onEdit?: (post: Post) => void
  onPostNow?: (post: Post) => void
  isPublishing?: boolean
}) {
  const Preview = getPreviewComponent(post.provider)
  const media = postToComposerMedia(post)
  const caption = getPostCaption(post)
  const description = post.description ?? ''
  const displayDate = getPostDisplayDate(post)
  const accountLabel = account.accountName || account.username || 'Account'
  const editable = isPostEditable(post.status)
  const showPostNow = canPostNow(post.status) && onPostNow

  return (
    <article
      className={cn(
        'group mb-4 break-inside-avoid overflow-hidden rounded-xl border border-border/50 bg-background',
        'transition-[border-color,box-shadow] duration-200 hover:border-border hover:shadow-sm',
        editable && onEdit && 'cursor-pointer',
      )}
      onClick={editable && onEdit ? () => onEdit(post) : undefined}
      onKeyDown={
        editable && onEdit
          ? event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onEdit(post)
              }
            }
          : undefined
      }
      role={editable && onEdit ? 'button' : undefined}
      tabIndex={editable && onEdit ? 0 : undefined}
    >
      <PreviewEmbedProvider embedded>
        <Preview
          account={account}
          caption={caption}
          description={description}
          media={media}
          postType={post.type}
        />
      </PreviewEmbedProvider>

      {showPostNow ? (
        <div className="border-t border-border/40 bg-muted/10 px-3 py-2">
          <Button
            type="button"
            size="sm"
            className="h-7 w-full gap-1.5 rounded-lg text-[11px] font-medium shadow-xs"
            disabled={isPublishing}
            onClick={event => {
              event.stopPropagation()
              onPostNow(post)
            }}
          >
            {isPublishing ? (
              <Loader2Icon className="size-3.5 animate-spin" strokeWidth={1.75} />
            ) : (
              <SendIcon className="size-3.5" strokeWidth={1.75} />
            )}
            {isPublishing ? 'Publishing…' : 'Post now'}
          </Button>
        </div>
      ) : null}

      <footer className="flex items-center justify-between gap-3 border-t border-border/40 bg-muted/20 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <SocialPlatformIcon provider={post.provider} size={11} className="size-5 shrink-0" />
          <p className="truncate text-[11px] text-muted-foreground">{accountLabel}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {editable && onEdit ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-7 rounded-lg opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
              aria-label="Edit post"
              onClick={event => {
                event.stopPropagation()
                onEdit(post)
              }}
            >
              <PencilIcon className="size-3.5" strokeWidth={1.75} />
            </Button>
          ) : null}
          <PostStatusIndicator status={post.status} />
          <span aria-hidden className="text-border/80">
            ·
          </span>
          <Tooltip>
            <TooltipTrigger asChild>
              <time
                dateTime={displayDate.toISOString()}
                className="cursor-default text-[11px] tabular-nums text-muted-foreground"
              >
                {formatRelativeTime(displayDate)}
              </time>
            </TooltipTrigger>
            <TooltipContent side="top">{formatPostDateTime(displayDate)}</TooltipContent>
          </Tooltip>
        </div>
      </footer>
    </article>
  )
})

function PostsDateHeading({
  date,
  posts,
  headingId,
}: {
  date: Date
  posts: Post[]
  headingId: string
}) {
  const heading = formatPostDateGroupHeading(date)
  const statusCounts = getPostStatusCounts(posts)
  const activeStatuses = STATUS_SUMMARY.filter(({ status }) => (statusCounts[status] ?? 0) > 0)

  return (
    <header className="sticky top-0 z-10 -mx-3 bg-background/90 px-3 pt-1 pb-3 backdrop-blur-sm supports-[backdrop-filter]:bg-background/75 sm:-mx-4 sm:px-4">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={headingId} className="text-sm font-semibold tracking-tight text-foreground">
              {heading.label}
            </h2>
            {heading.relativeBadge ? (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase',
                  heading.relativeBadge === 'today'
                    ? 'bg-primary/12 text-primary'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                {RELATIVE_BADGE_LABEL[heading.relativeBadge]}
              </span>
            ) : null}
          </div>
          {heading.subtitle ? (
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{heading.subtitle}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
          <p className="text-[11px] font-medium tabular-nums text-muted-foreground">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </p>
          {activeStatuses.length > 0 ? (
            <p className="max-w-[min(100%,16rem)] text-[11px] leading-snug text-muted-foreground/85">
              {activeStatuses.map(({ status, label, className: statusClassName }, index) => {
                const value = statusCounts[status] ?? 0

                return (
                  <span key={status}>
                    {index > 0 ? <span aria-hidden> · </span> : null}
                    <span className={cn('font-semibold tabular-nums', statusClassName)}>{value}</span>{' '}
                    {label}
                  </span>
                )
              })}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-3 h-px bg-border/50" aria-hidden />
    </header>
  )
}

const MASONRY_COLUMNS_CLASS =
  'columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3 xl:columns-4'

export function PostsGrid({
  posts,
  accountsById,
  onEditPost,
  onPostNow,
  publishingPostId = null,
  className,
}: PostsGridProps) {
  const postsByDate = useMemo(() => groupPostsByDateKey(posts, 'desc'), [posts])
  const dateKeys = useMemo(() => getSortedDateKeys(postsByDate, 'desc'), [postsByDate])

  return (
    <div className={cn('space-y-8 px-3 pt-0.5 pb-4 sm:px-4', className)}>
      {dateKeys.map(dateKey => {
        const groupPosts = postsByDate.get(dateKey) ?? []
        const headingId = `posts-date-${dateKey}`
        const sectionDate = getPostDisplayDate(groupPosts[0]!)
        const { label: sectionLabel } = formatPostDateGroupHeading(sectionDate)

        return (
          <section key={dateKey} aria-labelledby={headingId}>
            <PostsDateHeading date={sectionDate} posts={groupPosts} headingId={headingId} />

            <div
              className={cn(MASONRY_COLUMNS_CLASS, 'mt-4')}
              role="list"
              aria-label={`Posts for ${sectionLabel}`}
            >
              {groupPosts.map(post => {
                const account =
                  post.account ?? accountsById[post.accountId] ?? createFallbackAccount(post)

                return (
                  <PostPreviewCard
                    key={post._id}
                    post={post}
                    account={account}
                    onEdit={onEditPost}
                    onPostNow={onPostNow}
                    isPublishing={publishingPostId === post._id}
                  />
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
