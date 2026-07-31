import { AccountsOAuthHandler } from '@/components/accounts/accounts-oauth-handler'
import { AccountsView } from '@/components/accounts/accounts-view'
import { ConnectAccountTrigger } from '@/components/accounts/connect-account-trigger'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { dashboardSurface } from '@/components/dashboard'
import { PageHeader } from '@/components/headers/page-header'
import {
  getAccountsListQuery,
  hasActiveAccountFilters,
  parseAccountFiltersFromSearchParams,
} from '@/lib/accounts/account-filters'
import { getWorkspaceAccounts } from '@/services/account.service'
import { formatItemCount } from '@/utils/format'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import type { MetaResponse } from '@socialista/types'
import { Link2Icon } from 'lucide-react'
import { Suspense } from 'react'
import { WorkspaceRequired } from '../../../../components/dashboard/workspace-required'

type AccountsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const defaultMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: 50,
  hasNextPage: false,
  hasPreviousPage: false,
}

export default async function AccountsPage({ searchParams }: AccountsPageProps) {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view connected accounts." />
  }

  const params = await searchParams
  const query = getAccountsListQuery(params)
  const filters = parseAccountFiltersFromSearchParams(params)
  const hasFilters = hasActiveAccountFilters(filters)

  const { data, success, message, meta } = await getWorkspaceAccounts(workspace.id, {
    page: query.page,
    limit: query.limit,
    sort: query.sort,
    query: query.query,
    provider: query.provider,
    connectionStatus: query.connectionStatus,
  })

  const accounts = data?.accounts ?? []
  const metaData = meta ?? defaultMeta

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={null}>
        <AccountsOAuthHandler />
      </Suspense>

      <PageHeader
        title="Accounts"
        description={`${formatItemCount(metaData.total)} connected in ${workspace.name}`}
        actions={<ConnectAccountTrigger />}
      />

      {!success ? (
        <ErrorState
          title={message ?? 'Failed to load accounts'}
          description="Refresh the page to try again."
          className="flex-1 rounded-xl"
        />
      ) : metaData.total === 0 && !query.query && !hasFilters ? (
        <EmptyState
          icon={Link2Icon}
          title="Connect your social accounts"
          description="Link your profiles to schedule and publish content from one workspace."
          minHeight="lg"
          variant="hero"
          className="flex-1"
          iconClassName={dashboardSurface.emptyIcon}
          action={<ConnectAccountTrigger label="Connect account" showPlusIcon={false} />}
        />
      ) : (
        <Suspense fallback={null}>
          <AccountsView
            accounts={accounts}
            meta={metaData}
            searchQuery={query.query}
            filters={filters}
            hasFilters={hasFilters}
          />
        </Suspense>
      )}
    </div>
  )
}
