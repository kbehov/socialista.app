'use client'

import { SearchXIcon } from 'lucide-react'
import { useEffect, useMemo } from 'react'

import { DeleteConfirmDialog } from '@/components/common/delete-confirm-dialog'
import { EmptyState } from '@/components/common/empty-state'
import { SmartPagination } from '@/components/common/smart-pagination'
import { dashboardSurface } from '@/components/dashboard/surface'
import { useReportPageScroll } from '@/components/headers/page-scroll-compact'
import { PostEditSheet } from '@/components/posts/post-edit-sheet'
import { PostsCalendarView } from '@/components/posts/posts-calendar-view'
import { PostsGrid } from '@/components/posts/posts-grid'
import { PostsToolbar } from '@/components/posts/posts-toolbar'
import type { Filter } from '@/components/reui/filters'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePostFilters } from '@/hooks/use-post-filters'
import { usePostViewActions } from '@/hooks/use-post-view-actions'
import type { PostViewMode } from '@/lib/posts/post-filters'
import { getPostDeleteDescription, indexById } from '@/utils/post.utils'
import type { AccountSummary, MetaResponse, Post } from '@socialista/types'

type PostsViewProps = {
  posts: Post[]
  meta: MetaResponse
  accounts: AccountSummary[]
  filters: Filter<string>[]
  view: PostViewMode
  month: string
  hasFilters: boolean
}

function PostsEmptyState({
  accounts,
  filters,
  total,
  view,
  hasFilters,
  onClearFilters,
}: {
  accounts: AccountSummary[]
  filters: Filter<string>[]
  total: number
  view: PostViewMode
  hasFilters: boolean
  onClearFilters: () => void
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PostsToolbar accounts={accounts} filters={filters} total={total} view={view} />
      <EmptyState
        icon={SearchXIcon}
        title={hasFilters ? 'No posts match' : 'No posts yet'}
        description={
          hasFilters
            ? 'Try a different status, platform, or account — or clear filters to see everything.'
            : 'Create your first post to schedule content across your connected accounts.'
        }
        minHeight="lg"
        variant="hero"
        className="flex-1"
        iconClassName={dashboardSurface.emptyIcon}
        action={
          hasFilters ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-sm font-medium text-foreground underline-offset-4 transition-colors duration-150 hover:underline"
            >
              Clear filters
            </button>
          ) : undefined
        }
      />
    </div>
  )
}

export function PostsView({ posts, meta, accounts, filters, view, month, hasFilters }: PostsViewProps) {
  const { setMonth, clearFilters } = usePostFilters()
  const reportPageScroll = useReportPageScroll()
  const {
    editingPost,
    editSheetOpen,
    handleEditPost,
    handleEditSheetOpenChange,
    publishingPostId,
    handlePostNow,
    deleteTarget,
    setDeleteTarget,
    handleConfirmDelete,
    isDeleting,
  } = usePostViewActions()

  const accountsById = useMemo(() => indexById(accounts), [accounts])

  useEffect(() => {
    if (view !== 'list') {
      reportPageScroll(0)
    }
  }, [view, reportPageScroll])

  if (posts.length === 0) {
    return (
      <PostsEmptyState
        accounts={accounts}
        filters={filters}
        total={meta.total}
        view={view}
        hasFilters={hasFilters}
        onClearFilters={clearFilters}
      />
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
              onDeletePost={setDeleteTarget}
              publishingPostId={publishingPostId}
            />
          </ScrollArea>
          <SmartPagination meta={meta} className="shrink-0 px-3 sm:px-4" />
          <PostEditSheet
            post={editingPost}
            account={editingPost ? (accountsById[editingPost.accountId] ?? editingPost.account) : undefined}
            open={editSheetOpen}
            onOpenChange={handleEditSheetOpenChange}
          />
        </>
      )}

      <DeleteConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={open => {
          if (!open) setDeleteTarget(null)
        }}
        title="Delete post?"
        description={deleteTarget ? getPostDeleteDescription(deleteTarget) : ''}
        confirmLabel="Delete post"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
