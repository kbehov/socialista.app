import { AccountsOAuthHandler } from '@/components/accounts/accounts-oauth-handler'
import { CONNECTABLE_PLATFORMS } from '@/components/accounts/connect-account-dialog'
import { ConnectAccountTrigger } from '@/components/accounts/connect-account-trigger'
import { EmptyState } from '@/components/common/empty-state'
import { ErrorState } from '@/components/common/error-state'
import { PageHeader } from '@/components/headers/page-header'
import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { AccountsView } from '@/components/accounts/accounts-view'
import { WorkspaceRequired } from '../_components/workspace-required'
import { getAccountsListQuery } from '@/lib/account-filters'
import { getWorkspaceAccounts } from '@/services/account.service'
import { formatItemCount } from '@/utils/format'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import type { MetaResponse } from '@socialista/types'
import { Link2Icon } from 'lucide-react'
import { Suspense } from 'react'

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

  const response = await getWorkspaceAccounts(workspace.id, {
    page: query.page,
    limit: query.limit,
    sort: query.sort,
    query: query.query,
  })

  const accounts = response.data?.accounts ?? []
  const meta = response.data?.meta ?? defaultMeta

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Suspense fallback={null}>
        <AccountsOAuthHandler />
      </Suspense>

      <PageHeader
        title="Accounts"
        description={`${formatItemCount(meta.total)} connected in ${workspace.name}`}
        actions={<ConnectAccountTrigger />}
      />

      {!response.success ? (
        <ErrorState
          title={response.message ?? 'Failed to load accounts'}
          description="Refresh the page to try again."
          className="flex-1 rounded-xl"
        />
      ) : meta.total === 0 && !query.query ? (
        <EmptyState
          icon={Link2Icon}
          title="Connect your social accounts"
          description="Link your profiles to schedule and publish content from one workspace."
          minHeight="lg"
          variant="default"
          className="flex-1 rounded-2xl border-border/50 bg-gradient-to-b from-muted/25 via-muted/10 to-transparent"
          iconClassName="size-12 rounded-2xl border-0 bg-background shadow-xs ring-1 ring-border/50 [&_svg]:size-5"
          action={<ConnectAccountTrigger label="Connect account" showPlusIcon={false} />}
          footer={
            <div className="mt-8 flex flex-col items-center gap-5">
              <div className="flex items-center gap-2">
                {CONNECTABLE_PLATFORMS.map(platform => (
                  <SocialPlatformIcon
                    key={platform.provider}
                    provider={platform.provider}
                    size={14}
                    className="size-9 rounded-xl opacity-70 transition-opacity hover:opacity-100"
                  />
                ))}
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground/80">
                Each account can use its own timezone for scheduling.
              </p>
            </div>
          }
        />
      ) : (
        <Suspense fallback={null}>
          <AccountsView
            accounts={accounts}
            meta={meta}
            searchQuery={query.query}
          />
        </Suspense>
      )}
    </div>
  )
}
