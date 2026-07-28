import { ConnectAccountTrigger } from '@/components/accounts/connect-account-trigger'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { dashboardSurface } from '@/components/dashboard'
import { PageHeader } from '@/components/headers/page-header'
import { PostsView } from '@/components/posts/posts-view'
import { Button } from '@/components/ui/button'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { getPostsListQuery, hasActivePostFilters, parsePostFiltersFromSearchParams } from '@/lib/post-filters'
import { getWorkspaceAccounts } from '@/services/account.service'
import { getWorkspacePosts } from '@/services/post.service'
import { formatItemCount } from '@/utils/format'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import type { MetaResponse } from '@socialista/types'
import { CalendarClockIcon, PlusIcon } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

import { WorkspaceRequired } from '../../../../components/dashboard/workspace-required'

type PostsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const defaultMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: 20,
  hasNextPage: false,
  hasPreviousPage: false,
}

export default async function PostsPage({ searchParams }: PostsPageProps) {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view posts." />
  }

  const params = await searchParams
  const query = getPostsListQuery(params)
  const filters = parsePostFiltersFromSearchParams(params)
  const hasFilters = hasActivePostFilters(filters)

  const [accountsResponse, postsResponse] = await Promise.all([
    getWorkspaceAccounts(workspace.id, { limit: 100, connectionStatus: 'connected' }),
    getWorkspacePosts(workspace.id, {
      page: query.page,
      limit: query.limit,
      sort: query.sort,
      status: query.status,
      provider: query.provider,
      account: query.account,
      from: query.from,
      to: query.to,
    }),
  ])

  const accounts = accountsResponse.data?.accounts ?? []
  const posts = postsResponse.data?.posts ?? []
  const meta = postsResponse.meta ?? defaultMeta

  const createAction = (
    <Button asChild size="sm" className="h-9 gap-1.5 rounded-xl px-3.5 shadow-xs">
      <Link href={`${DASHBOARD_ROUTES.POSTS}/create`}>
        <PlusIcon className="size-4" strokeWidth={1.75} />
        Create post
      </Link>
    </Button>
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <PageHeader
        title="Posts"
        description={`${formatItemCount(meta.total)} in ${workspace.name}`}
        actions={accounts.length > 0 ? createAction : undefined}
      />

      {!accountsResponse.success ? (
        <ErrorState
          title={accountsResponse.message ?? 'Failed to load accounts'}
          description="Refresh the page to try again."
          className="flex-1 rounded-xl"
        />
      ) : !postsResponse.success ? (
        <ErrorState
          title={postsResponse.message ?? 'Failed to load posts'}
          description="Refresh the page to try again."
          className="flex-1 rounded-xl"
        />
      ) : accounts.length === 0 ? (
        <EmptyState
          icon={CalendarClockIcon}
          title="Connect accounts to start posting"
          description="Link your social profiles, then create and schedule posts from one place."
          minHeight="lg"
          variant="hero"
          className="flex-1"
          iconClassName={dashboardSurface.emptyIcon}
          action={<ConnectAccountTrigger label="Connect account" showPlusIcon={false} />}
        />
      ) : meta.total === 0 && !hasFilters ? (
        <EmptyState
          icon={CalendarClockIcon}
          title="No posts yet"
          description="Plan your content calendar, schedule across platforms, and keep every account on track."
          minHeight="lg"
          variant="hero"
          className="flex-1"
          iconClassName="size-12 rounded-2xl border-0 bg-background shadow-xs ring-1 ring-border/60 [&_svg]:size-5"
          action={createAction}
        />
      ) : (
        <Suspense fallback={null}>
          <div className="flex min-h-0 flex-1 flex-col">
            <PostsView
              posts={posts}
              meta={meta}
              accounts={accounts}
              filters={filters}
              view={query.view}
              month={query.month}
              hasFilters={hasFilters}
            />
          </div>
        </Suspense>
      )}
    </div>
  )
}
