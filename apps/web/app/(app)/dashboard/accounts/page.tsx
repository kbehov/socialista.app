import { AccountEmptyMarks } from '@/components/accounts/account-empty-marks'
import { AccountsOAuthHandler } from '@/components/accounts/accounts-oauth-handler'
import { AccountsView } from '@/components/accounts/accounts-view'
import { ConnectAccountTrigger } from '@/components/accounts/connect-account-trigger'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { PageHeader } from '@/components/headers/page-header'
import {
  getAccountsListQuery,
  hasActiveAccountFilters,
  parseAccountFiltersFromSearchParams,
} from '@/lib/accounts/account-filters'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'
import { getWorkspaceAccounts } from '@/services/account.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'
import type { MetaResponse } from '@socialista/types'
import { Suspense } from 'react'
import { WorkspaceRequired } from '../../../../components/dashboard/workspace-required'

type AccountsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export const metadata = createDashboardMetadata('Accounts')

const defaultMeta: MetaResponse = {
  total: 0,
  page: 1,
  limit: 50,
  hasNextPage: false,
  hasPreviousPage: false, 
}

function formatAccountsDescription(total: number, workspaceName: string) {
  const count = total === 1 ? '1 account' : `${total.toLocaleString()} accounts`
  return `${count} in ${workspaceName}`
}

export default async function AccountsPage({ searchParams }: AccountsPageProps) {
  const { workspace, project } = await getCurrentWorkspaceContext()

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
    projectId: project?.id,
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
        description={formatAccountsDescription(metaData.total, workspace.name)}
        actions={<ConnectAccountTrigger />}
      />

      {!success ? (
        <ErrorState
          title={message ?? 'Failed to load accounts'}
          description="Refresh the page to try again."
          className="flex-1 rounded-lg"
        />
      ) : metaData.total === 0 && !query.query && !hasFilters ? (
        <EmptyState
          visual={<AccountEmptyMarks />}
          title="Connect an account"
          description="Link Instagram, TikTok, LinkedIn, and more — then schedule everything from one place."
          minHeight="lg"
          variant="hero"
          className="flex-1"
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
