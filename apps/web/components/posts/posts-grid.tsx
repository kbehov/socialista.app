'use client'

import { useMemo } from 'react'

import { usePageScrollCompact } from '@/components/headers/page-scroll-compact'
import { PostPreviewCard } from '@/components/posts/post-preview-card'
import { PostsDateHeading } from '@/components/posts/posts-date-heading'
import {
  formatPostDateGroupHeading,
  getPostDisplayDate,
  getSortedDateKeys,
  groupPostsByDateKey,
  resolvePostAccount,
} from '@/lib/posts/post-display'
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

const MASONRY_COLUMNS_CLASS = 'columns-1 gap-4 sm:columns-2 sm:gap-5 lg:columns-3 xl:columns-4'

export function PostsGrid({
  posts,
  accountsById,
  onEditPost,
  onPostNow,
  onDeletePost,
  publishingPostId = null,
  className,
}: PostsGridProps) {
  const compact = usePageScrollCompact()
  const postsByDate = useMemo(() => groupPostsByDateKey(posts, 'desc'), [posts])
  const dateKeys = useMemo(() => getSortedDateKeys(postsByDate, 'desc'), [postsByDate])

  return (
    <div
      className={cn('px-3 pt-1 pb-6 sm:px-4', compact ? 'space-y-7' : 'space-y-10', className)}
    >
      {dateKeys.map(dateKey => {
        const groupPosts = postsByDate.get(dateKey) ?? []
        const firstPost = groupPosts[0]
        if (!firstPost) return null

        const headingId = `posts-date-${dateKey}`
        const sectionDate = getPostDisplayDate(firstPost)
        const { label: sectionLabel } = formatPostDateGroupHeading(sectionDate)

        return (
          <section key={dateKey} aria-labelledby={headingId}>
            <PostsDateHeading date={sectionDate} posts={groupPosts} headingId={headingId} />

            <div
              className={cn(
                MASONRY_COLUMNS_CLASS,
                compact ? 'mt-3' : 'mt-4',
              )}
              role="list"
              aria-label={`Posts for ${sectionLabel}`}
            >
              {groupPosts.map(post => (
                <PostPreviewCard
                  key={post._id}
                  post={post}
                  account={resolvePostAccount(post, accountsById)}
                  onEdit={onEditPost}
                  onPostNow={onPostNow}
                  onDelete={onDeletePost}
                  isPublishing={publishingPostId === post._id}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
