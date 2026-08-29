'use client'

import { POST_ROW_GRID, PostRow } from '@/components/posts/post-row'
import { resolvePostAccount } from '@/lib/posts/post-display'
import { cn } from '@/lib/utils'
import type { AccountSummary, Post } from '@socialista/types'

type PostsTableProps = {
  posts: Post[]
  accountsById: Record<string, AccountSummary>
  onEditPost?: (post: Post) => void
  onPostNow?: (post: Post) => void
  onDeletePost?: (post: Post) => void
  publishingPostId?: string | null
  className?: string
}

export function PostsTable({
  posts,
  accountsById,
  onEditPost,
  onPostNow,
  onDeletePost,
  publishingPostId = null,
  className,
}: PostsTableProps) {
  return (
    <div className={cn('min-w-0', className)}>
      <div
        className={cn(
          'sticky top-0 z-10 hidden border-b border-foreground/10 bg-background py-2',
          POST_ROW_GRID,
        )}
        aria-hidden
      >
        <span className="text-[11px] font-medium text-foreground/56">Post</span>
        <span className="hidden text-[11px] font-medium text-foreground/56 sm:block">Platform</span>
        <span className="hidden text-[11px] font-medium text-foreground/56 sm:block">Status</span>
        <span className="hidden text-[11px] font-medium text-foreground/56 lg:block">Type</span>
        <span className="hidden text-[11px] font-medium text-foreground/56 xl:block">Account</span>
        <span className="hidden text-[11px] font-medium text-foreground/56 lg:block">When</span>
        <span aria-hidden />
      </div>

      <ul className="divide-y divide-foreground/10">
        {posts.map(post => (
          <PostRow
            key={post._id}
            post={post}
            account={resolvePostAccount(post, accountsById)}
            onEdit={onEditPost}
            onPostNow={onPostNow}
            onDelete={onDeletePost}
            isPublishing={publishingPostId === post._id}
          />
        ))}
      </ul>
    </div>
  )
}
