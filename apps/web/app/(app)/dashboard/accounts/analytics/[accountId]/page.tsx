import { AccountAnalyticsView } from '@/components/analytics/account-analytics-view'
import { AnalyticsRangeToggle } from '@/components/analytics/analytics-range-toggle'
import { UpgradeTeaser } from '@/components/analytics/upgrade-teaser'
import { ErrorState } from '@/components/common/error-state'
import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { PageHeader } from '@/components/headers/page-header'
import { getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { ApiError } from '@/lib/api'
import { getAccount } from '@/services/account.service'
import { loadAccountAnalytics } from '@/services/analytics.service'
import { parseAnalyticsRange } from '@/utils/parsers'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import type { AnalyticsAccountInfo, WorkspaceResponse } from '@socialista/types'
import { notFound } from 'next/navigation'

type AccountAnalyticsPageProps = {
  params: Promise<{ accountId: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function hasWorkspaceAnalyticsAccess(workspace: WorkspaceResponse): boolean {
  return (
    (workspace.billing.plan === 'pro' || workspace.billing.plan === 'enterprise') &&
    workspace.billing.status === 'active'
  )
}

function accountDescription(account: Pick<AnalyticsAccountInfo, 'username' | 'provider'>): string {
  const platform = getSocialPlatformLabel(account.provider)
  const username = account.username?.trim()
  if (!username) return `${platform} · account performance`
  const handle = username.startsWith('@') ? username : `@${username}`
  return `${handle} · ${platform}`
}

function toAnalyticsAccountInfo(account: {
  _id: string
  provider: AnalyticsAccountInfo['provider']
  accountName: string
  username?: string
  accountAvatar?: string
}): AnalyticsAccountInfo {
  return {
    id: account._id,
    provider: account.provider,
    accountName: account.accountName,
    username: account.username,
    avatar: account.accountAvatar,
  }
}

export default async function AccountAnalyticsPage({ params, searchParams }: AccountAnalyticsPageProps) {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view account analytics." />
  }

  const [{ accountId }, search] = await Promise.all([params, searchParams])
  const range = parseAnalyticsRange(search.range)
  const basePath = DASHBOARD_ROUTES.accountAnalytics(accountId)
  const isPremium = hasWorkspaceAnalyticsAccess(workspace)

  if (!isPremium) {
    let accountInfo: AnalyticsAccountInfo | null = null
    try {
      const { success, data } = await getAccount(accountId)
      if (success && data?.account && data.account.workspaceId === workspace.id) {
        accountInfo = toAnalyticsAccountInfo(data.account)
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        notFound()
      }
    }

    if (!accountInfo) {
      notFound()
    }

    return (
      <div className="flex min-h-0 flex-1 flex-col ">
        <PageHeader
          title={accountInfo.accountName}
          description={accountDescription(accountInfo)}
          backHref={DASHBOARD_ROUTES.ACCOUNTS}
          breadcrumbs={[{ label: 'Accounts', href: DASHBOARD_ROUTES.ACCOUNTS }, { label: accountInfo.accountName }]}
        />
        <UpgradeTeaser />
      </div>
    )
  }

  const {
    data,
    error,
    notFound: missing,
  } = await loadAccountAnalytics({
    workspaceId: workspace.id,
    accountId,
    range,
  })

  if (missing) {
    notFound()
  }

  if (error || !data) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <PageHeader
          title="Account analytics"
          description="Couldn't load this account"
          backHref={DASHBOARD_ROUTES.ACCOUNTS}
          breadcrumbs={[{ label: 'Accounts', href: DASHBOARD_ROUTES.ACCOUNTS }, { label: 'Analytics' }]}
          actions={<AnalyticsRangeToggle range={range} basePath={basePath} />}
        />
        <div className="flex flex-1 items-center justify-center">
          <ErrorState
            title="Couldn't load analytics"
            description={error ?? 'Something went wrong while loading account analytics.'}
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title={data.account.accountName}
        description={accountDescription(data.account)}
        backHref={DASHBOARD_ROUTES.ACCOUNTS}
        breadcrumbs={[{ label: 'Accounts', href: DASHBOARD_ROUTES.ACCOUNTS }, { label: data.account.accountName }]}
        actions={<AnalyticsRangeToggle range={range} basePath={basePath} />}
      />

      <AccountAnalyticsView workspaceId={workspace.id} data={data} />
    </div>
  )
}
