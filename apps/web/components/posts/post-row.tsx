'use client'

import { PostStatusBadge } from '@/components/posts/post-status-badge'
import {
  formatPostDateTime,
  formatPostTime,
} from '@/components/posts/post-meta'
import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { POST_TYPE_LABELS, getPostDisplayDate, getPostPreviewText, getPostThumbnail } from '@/lib/post-display'
import { TableCell, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/utils/format'
import type { AccountSummary, Post } from '@socialista/types'
import { FileTextIcon, ImageIcon, VideoIcon } from 'lucide-react'

type PostRowProps = {
  post: Post
  account?: AccountSummary
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
        <FileTextIcon className="size-4 opacity-70" strokeWidth={1.75} />
      ) : post.type === 'video' || post.type === 'reel' ? (
        <VideoIcon className="size-4 opacity-70" strokeWidth={1.75} />
      ) : (
        <ImageIcon className="size-4 opacity-70" strokeWidth={1.75} />
      )}
    </span>
  )
}

export function PostRow({ post, account }: PostRowProps) {
  const title = getPostPreviewText(post)
  const displayDate = getPostDisplayDate(post)
  const accountLabel = account?.accountName || account?.username || 'Account'

  return (
    <TableRow className="border-border/50 hover:bg-muted/20">
      <TableCell className="px-4 py-3.5 whitespace-normal">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
            <PostThumb post={post} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-medium tracking-tight text-foreground">{title}</p>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground md:hidden">
              {getSocialPlatformLabel(post.provider)} · {POST_TYPE_LABELS[post.type]}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell className="hidden px-4 py-3.5 md:table-cell">
        <div className="flex min-w-0 items-center gap-2">
          <SocialPlatformIcon provider={post.provider} size={13} className="size-7" />
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground">{accountLabel}</p>
            <p className="truncate text-xs text-muted-foreground">
              {getSocialPlatformLabel(post.provider)}
            </p>
          </div>
        </div>
      </TableCell>

      <TableCell className="hidden px-4 py-3.5 sm:table-cell">
        <span className="text-sm text-muted-foreground">{POST_TYPE_LABELS[post.type]}</span>
      </TableCell>

      <TableCell className="px-4 py-3.5">
        <PostStatusBadge status={post.status} />
      </TableCell>

      <TableCell className="hidden px-4 py-3.5 lg:table-cell">
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="cursor-default text-sm tabular-nums text-muted-foreground">
              {formatRelativeTime(displayDate)}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top">{formatPostDateTime(displayDate)}</TooltipContent>
        </Tooltip>
      </TableCell>

      <TableCell className="hidden px-4 py-3.5 xl:table-cell">
        <span className="text-sm tabular-nums text-muted-foreground">
          {formatPostTime(displayDate)}
        </span>
      </TableCell>
    </TableRow>
  )
}

export function PostListCard({ post, account, className }: PostRowProps & { className?: string }) {
  const title = getPostPreviewText(post)
  const displayDate = getPostDisplayDate(post)
  const accountLabel = account?.accountName || account?.username || 'Account'

  return (
    <article
      className={cn(
        'rounded-xl border border-border/60 bg-background p-3 shadow-xs transition-colors hover:bg-muted/15',
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
          <PostThumb post={post} />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {accountLabel} · {getSocialPlatformLabel(post.provider)}
              </p>
            </div>
            <PostStatusBadge status={post.status} className="shrink-0" />
          </div>
          <p className="text-xs tabular-nums text-muted-foreground">
            {formatPostDateTime(displayDate)}
          </p>
        </div>
      </div>
    </article>
  )
}
