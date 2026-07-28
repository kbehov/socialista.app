import { auth } from '@/auth'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { AnalyticsRangeToggle } from '@/components/analytics/analytics-range-toggle'
import { ErrorState } from '@/components/common/error-state'
import { DashboardGreeting } from '@/components/dashboard/dashboard-greeting'
import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { PageHeader } from '@/components/headers/page-header'
import { getFirstName, getGreeting } from '@/lib/greeting'
import { getAnalyticsOverview } from '@/services/analytics.service'
import {
  parseAnalyticsProvider,
  parseAnalyticsRange,
  parseAnalyticsRankBy,
} from '@/utils/parsers'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'

type DashboardPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const [workspace, session] = await Promise.all([getCurrentWorkspace(), auth()])
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

  const { data, success, message } = await getAnalyticsOverview(workspace.id, { range })

  if (!success || !data) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <PageHeader
          title={<DashboardGreeting greeting={greeting} name={firstName} period={period} />}
          description={workspace.name}
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
  if (provider !== 'all') rangeParams.provider = provider
  if (rankBy !== 'followerGrowth') rangeParams.rankBy = rankBy

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={<DashboardGreeting greeting={greeting} name={firstName} period={period} />}
        description={`${workspace.name} · analytics at a glance`}
        actions={
          <AnalyticsRangeToggle
            range={range}
            params={Object.keys(rangeParams).length > 0 ? rangeParams : undefined}
          />
        }
      />

      <AnalyticsDashboard
        workspaceId={workspace.id}
        overview={data}
        range={range}
        rankBy={rankBy}
        provider={provider}
      />
    </div>
  )
}
