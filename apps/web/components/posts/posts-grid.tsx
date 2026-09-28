'use client'

import { PostGridCard } from '@/components/posts/post-grid-card'
import { resolvePostAccount } from '@/lib/posts/post-display'
import { cn } from '@/lib/utils'
import type { AccountSummary, Post } from '@socialista/types'

type PostsGridProps = {
  posts: Post[]
  accountsById: Record<string, AccountSummary>
  onEditPost?: (post: Post) => void
  onPostNow?: (post: Post) => void
  onDeletePost?: (post: Post) => void
  publishingPostId?: string | null
  className?: string
}

export function PostsGrid({
  posts,
  accountsById,
  onEditPost,
  onPostNow,
  onDeletePost,
  publishingPostId = null,
  className,
}: PostsGridProps) {
  return (
    <ul
      className={cn(
        'grid grid-cols-1 gap-3 pb-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        className,
      )}
    >
      {posts.map(post => (
        <li key={post._id} className="min-w-0">
          <PostGridCard
            post={post}
            account={resolvePostAccount(post, accountsById)}
            onEdit={onEditPost}
            onPostNow={onPostNow}
            onDelete={onDeletePost}
            isPublishing={publishingPostId === post._id}
          />
        </li>
      ))}
    </ul>
  )
}
