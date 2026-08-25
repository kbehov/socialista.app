import { auth } from '@/auth'
import { AccountAnalyticsView } from '@/components/analytics/account-analytics-view'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { AnalyticsRangeToggle } from '@/components/analytics/analytics-range-toggle'
import { UpgradeTeaser } from '@/components/analytics/upgrade-teaser'
import { ErrorState } from '@/components/common/error-state'
import { DashboardGreeting } from '@/components/dashboard/dashboard-greeting'
import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { PageHeader } from '@/components/headers/page-header'
import { getWorkspaceAccounts } from '@/services/account.service'
import { getAnalyticsOverview, loadAccountAnalytics } from '@/services/analytics.service'
import { getFirstName, getGreeting } from '@/utils/greeting'
import {
  parseAnalyticsAccountId,
  parseAnalyticsProvider,
  parseAnalyticsRange,
  parseAnalyticsRankBy,
} from '@/utils/parsers'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'
import type { AccountAnalyticsResponse } from '@socialista/types'
import type { ReactNode } from 'react'

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const [{ workspace, project }, session] = await Promise.all([getCurrentWorkspaceContext(), auth()])
  const userName = session?.user?.name ?? 'User'
  const { text: greeting, period } = getGreeting()
  const firstName = getFirstName(userName)

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view analytics." />
  }

  const params = await searchParams
  const range = parseAnalyticsRange(params.range)
  const provider = parseAnalyticsProvider(params.provider)
  const rankBy = parseAnalyticsRankBy(params.rankBy)
  const requestedAccountId = parseAnalyticsAccountId(params.account)
  const projectId = project?.id

  const [overviewResult, accountsResult] = await Promise.all([
    getAnalyticsOverview(workspace.id, { range, projectId }),
    getWorkspaceAccounts(workspace.id, {
      limit: 100,
      connectionStatus: 'connected',
      projectId,
    }),
  ])

  const { data, success, message } = overviewResult
  const accounts = accountsResult.data?.accounts ?? []
  const selectedAccount = requestedAccountId
    ? accounts.find(account => account._id === requestedAccountId)
    : undefined
  const selectedAccountId = selectedAccount?._id

  if (!success || !data) {
    return (
      <div>
        <PageHeader
          title={<DashboardGreeting greeting={greeting} name={firstName} period={period} />}
          description={project?.name ?? workspace.name}
        />
        <div className="flex flex-1 items-center justify-center">
          <ErrorState
            title="Couldn't load analytics"
            description={message ?? 'Something went wrong while loading analytics.'}
          />
        </div>
      </div>
    )
  }

  const rangeParams: Record<string, string | undefined> = {}
  if (!selectedAccountId && provider !== 'all') rangeParams.provider = provider
  if (rankBy !== 'followerGrowth') rangeParams.rankBy = rankBy
  if (selectedAccountId) rangeParams.account = selectedAccountId

  let accountView: ReactNode = null
  if (selectedAccountId) {
    if (data.tier !== 'premium') {
      accountView = <UpgradeTeaser />
    } else {
      const accountAnalytics = await loadAccountAnalytics({
        workspaceId: workspace.id,
        accountId: selectedAccountId,
        range,
      })
      accountView = renderAccountView(workspace.id, accountAnalytics)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={<DashboardGreeting greeting={greeting} name={firstName} period={period} />}
        description={`${project?.name ?? workspace.name} · overview`}
        actions={
          <AnalyticsRangeToggle range={range} params={Object.keys(rangeParams).length > 0 ? rangeParams : undefined} />
        }
      />

      <AnalyticsDashboard
        workspaceId={workspace.id}
        projectId={projectId}
        overview={data}
        range={range}
        rankBy={rankBy}
        provider={selectedAccountId ? 'all' : provider}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        accountView={accountView}
      />
    </div>
  )
}

function renderAccountView(
  workspaceId: string,
  result: {
    data: AccountAnalyticsResponse | null | undefined
    error: string | null
    notFound: boolean
  },
) {
  if (result.notFound) {
    return (
      <ErrorState
        title="Account not found"
        description="This account is not in the current project."
      />
    )
  }

  if (result.error || !result.data) {
    return (
      <ErrorState
        title="Couldn't load analytics"
        description={result.error ?? 'Something went wrong while loading account analytics.'}
      />
    )
  }

  return <AccountAnalyticsView workspaceId={workspaceId} data={result.data} hideExport />
}
