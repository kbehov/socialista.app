'use client'

import { EmptyState } from '@/components/common/empty-state'
import { PostsCalendarView } from '@/components/posts/posts-calendar-view'
import { PostsPagination } from '@/components/posts/posts-pagination'
import { PostsToolbar } from '@/components/posts/posts-toolbar'
import { PostsTable } from '@/components/tables/posts.table'
import { usePostFilters } from '@/hooks/use-post-filters'
import type { Filter } from '@/components/reui/filters'
import type { PostViewMode } from '@/lib/post-filters'
import type { AccountSummary, MetaResponse, Post } from '@socialista/types'
import { SearchXIcon } from 'lucide-react'
import { useMemo } from 'react'

type PostsViewProps = {
  posts: Post[]
  meta: MetaResponse
  accounts: AccountSummary[]
  filters: Filter<string>[]
  view: PostViewMode
  month: string
  hasFilters: boolean
}

export function PostsView({
  posts,
  meta,
  accounts,
  filters,
  view,
  month,
  hasFilters,
}: PostsViewProps) {
  const { setMonth } = usePostFilters()

  const accountsById = useMemo(
    () => Object.fromEntries(accounts.map(account => [account._id, account])),
    [accounts],
  )

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
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PostsToolbar accounts={accounts} filters={filters} total={meta.total} view={view} />

      {view === 'calendar' ? (
        <PostsCalendarView
          posts={posts}
          accountsById={accountsById}
          monthKey={month}
          onMonthChange={setMonth}
        />
      ) : (
        <>
          <PostsTable posts={posts} accountsById={accountsById} />
          <PostsPagination meta={meta} />
        </>
      )}
    </div>
  )
}
