'use client'

import { publishExistingPost } from '@/actions/post.actions'
import { EmptyState } from '@/components/common/empty-state'
import { SmartPagination } from '@/components/common/smart-pagination'
import { PostEditSheet } from '@/components/posts/post-edit-sheet'
import { PostsCalendarView } from '@/components/posts/posts-calendar-view'
import { PostsGrid } from '@/components/posts/posts-grid'
import { PostsToolbar } from '@/components/posts/posts-toolbar'
import type { Filter } from '@/components/reui/filters'
import { useReportPageScroll } from '@/components/headers/page-scroll-compact'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePostFilters } from '@/hooks/use-post-filters'
import type { PostViewMode } from '@/lib/post-filters'
import type { AccountSummary, MetaResponse, Post } from '@socialista/types'
import { SearchXIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'

type PostsViewProps = {
  posts: Post[]
  meta: MetaResponse
  accounts: AccountSummary[]
  filters: Filter<string>[]
  view: PostViewMode
  month: string
  hasFilters: boolean
}

export function PostsView({ posts, meta, accounts, filters, view, month, hasFilters }: PostsViewProps) {
  const router = useRouter()
  const { setMonth } = usePostFilters()
  const reportPageScroll = useReportPageScroll()
  const [isPublishing, startPublishTransition] = useTransition()
  const [editingPost, setEditingPost] = useState<Post | null>(null)
  const [editSheetOpen, setEditSheetOpen] = useState(false)
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null)

  const accountsById = useMemo(() => Object.fromEntries(accounts.map(account => [account._id, account])), [accounts])

  const handleEditPost = (post: Post) => {
    setEditingPost(post)
    setEditSheetOpen(true)
  }

  const handleEditSheetOpenChange = (open: boolean) => {
    setEditSheetOpen(open)
    if (!open) setEditingPost(null)
  }

  const handlePostNow = (post: Post) => {
    if (isPublishing) return

    setPublishingPostId(post._id)
    startPublishTransition(async () => {
      const result = await publishExistingPost(post._id)
      setPublishingPostId(null)

      if (!result.success) {
        toast.error(result.message ?? 'Failed to publish post')
        return
      }

      toast.success('Post is publishing')
      router.refresh()
    })
  }

  useEffect(() => {
    if (view !== 'list') {
      reportPageScroll(0)
    }
  }, [view, reportPageScroll])

  if (posts.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <PostsToolbar accounts={accounts} filters={filters} total={meta.total} view={view} />
        <EmptyState
          icon={SearchXIcon}
          title={hasFilters ? 'No posts match your filters' : 'No posts yet'}
          description={
            hasFilters
              ? 'Try removing a filter or choosing a different status, platform, or account.'
              : 'Create your first post to schedule content across your connected accounts.'
          }
          minHeight="lg"
          variant="default"
          className="flex-1 rounded-2xl border-border/60 bg-gradient-to-b from-muted/30 to-muted/10"
          iconClassName="size-12 rounded-2xl border-0 bg-background shadow-xs ring-1 ring-border/60 [&_svg]:size-5"
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
      <PostsToolbar accounts={accounts} filters={filters} total={meta.total} view={view} />

      {view === 'calendar' ? (
        <PostsCalendarView
          className="min-h-0 flex-1"
          posts={posts}
          accountsById={accountsById}
          monthKey={month}
          onMonthChange={setMonth}
        />
      ) : (
        <>
          <ScrollArea
            className="min-h-0 flex-1"
            scrollFade
            scrollbarGutter
            onViewportScroll={event => reportPageScroll(event.currentTarget.scrollTop)}
          >
            <PostsGrid
              posts={posts}
              accountsById={accountsById}
              onEditPost={handleEditPost}
              onPostNow={handlePostNow}
              publishingPostId={publishingPostId}
            />
          </ScrollArea>
          <SmartPagination meta={meta} className="shrink-0" />
          <PostEditSheet
            post={editingPost}
            account={editingPost ? accountsById[editingPost.accountId] ?? editingPost.account : undefined}
            open={editSheetOpen}
            onOpenChange={handleEditSheetOpenChange}
          />
        </>
      )}
    </div>
  )
}
