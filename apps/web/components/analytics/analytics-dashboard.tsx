import { Suspense, type ReactNode } from 'react'

import type {
  AccountSummary,
  AnalyticsAccountPerformanceRankBy,
  AnalyticsOverviewResponse,
  AnalyticsRange,
  SocialProvider,
} from '@socialista/types'

import RefreshButton from '../common/refresh-button'
import { AccountFilter } from './account-filter'
import { AnalyticsExportCsvButton } from './analytics-export-csv-button'
import { AnalyticsSkeleton } from './analytics-skeleton'
import { OverviewMetrics } from './overview-metrics'
import { AccountPerformancePanel } from './panels/account-performance-panel'
import { AnomaliesPanel } from './panels/anomalies-panel'
import { GrowthPanel } from './panels/growth-panel'
import { PlatformSummaryPanel } from './panels/platform-summary-panel'
import { PlatformsPanel } from './panels/platforms-panel'
import { PublishedActivityPanel } from './panels/published-activity-panel'
import { PlatformFilter } from './platform-filter'
import { UpgradeTeaser } from './upgrade-teaser'

export type AnalyticsDashboardProps = {
  workspaceId: string
  projectId?: string
  overview: AnalyticsOverviewResponse
  range: AnalyticsRange
  rankBy?: AnalyticsAccountPerformanceRankBy
  provider?: SocialProvider | 'all'
  accounts?: AccountSummary[]
  selectedAccountId?: string
  accountView?: ReactNode
}

function AnalyticsDashboard({
  workspaceId,
  projectId,
  overview,
  range,
  rankBy = 'followerGrowth',
  provider = 'all',
  accounts = [],
  selectedAccountId,
  accountView,
}: AnalyticsDashboardProps) {
  const isPremium = overview.tier === 'premium'
  const platforms = overview.free.accountsByProvider.map(row => ({
    provider: row.provider,
    accounts: row.accounts,
  }))
  const showAccountFilter = accounts.length > 0
  const showPlatformFilter = !selectedAccountId && platforms.length > 0
  const showToolbar = showAccountFilter || showPlatformFilter || isPremium

  return (
    <div className="flex w-full flex-col gap-8 pb-10">
      {showToolbar ? (
        <div className="flex flex-wrap items-center gap-2">
          {showAccountFilter ? (
            <AccountFilter
              accounts={accounts}
              active={selectedAccountId}
              range={range}
              rankBy={rankBy}
              provider={provider}
            />
          ) : null}
          {showPlatformFilter ? (
            <PlatformFilter
              platforms={platforms}
              active={provider}
              range={range}
              rankBy={rankBy}
              className="min-w-0 flex-1"
            />
          ) : (
            <div className="min-w-0 flex-1" />
          )}
          <RefreshButton />
          {isPremium ? (
            <AnalyticsExportCsvButton
              workspaceId={workspaceId}
              range={range}
              accountId={selectedAccountId}
              projectId={projectId}
            />
          ) : null}
        </div>
      ) : null}

      {selectedAccountId ? (
        accountView
      ) : (
        <ProjectAnalyticsPanels
          workspaceId={workspaceId}
          projectId={projectId}
          overview={overview}
          range={range}
          rankBy={rankBy}
          provider={provider}
          isPremium={isPremium}
        />
      )}
    </div>
  )
}

function ProjectAnalyticsPanels({
  workspaceId,
  projectId,
  overview,
  range,
  rankBy,
  provider,
  isPremium,
}: {
  workspaceId: string
  projectId?: string
  overview: AnalyticsOverviewResponse
  range: AnalyticsRange
  rankBy: AnalyticsAccountPerformanceRankBy
  provider: SocialProvider | 'all'
  isPremium: boolean
}) {
  return (
    <>
      <OverviewMetrics overview={overview} />

      {isPremium ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
          <Suspense
            fallback={
              <AnalyticsSkeleton
                title="Growth"
                description="Audience and engagement over time."
                heightClassName="h-[220px]"
              />
            }
          >
            <GrowthPanel workspaceId={workspaceId} range={range} provider={provider} projectId={projectId} />
          </Suspense>

          <Suspense
            fallback={<AnalyticsSkeleton title="Platforms" description="Audience by network." heightClassName="h-40" />}
          >
            <PlatformSummaryPanel
              workspaceId={workspaceId}
              range={range}
              overview={overview}
              provider={provider}
              projectId={projectId}
            />
          </Suspense>
        </div>
      ) : null}

      {isPremium ? (
        <Suspense
          key={rankBy}
          fallback={
            <AnalyticsSkeleton
              title="Top movers"
              description="Biggest wins and losses this period."
              heightClassName="h-40"
            />
          }
        >
          <AccountPerformancePanel
            workspaceId={workspaceId}
            range={range}
            rankBy={rankBy}
            provider={provider}
            projectId={projectId}
          />
        </Suspense>
      ) : null}

      <Suspense fallback={<AnalyticsSkeleton title="Publishing activity" heightClassName="h-28" />}>
        <PublishedActivityPanel workspaceId={workspaceId} provider={provider} projectId={projectId} />
      </Suspense>

      {isPremium ? (
        <div className="flex flex-col gap-6">
          <Suspense
            fallback={
              <AnalyticsSkeleton
                title="Platform breakdown"
                description="Performance by provider."
                heightClassName="h-40"
              />
            }
          >
            <PlatformsPanel
              workspaceId={workspaceId}
              range={range}
              overview={overview}
              provider={provider}
              projectId={projectId}
            />
          </Suspense>

          <Suspense
            fallback={
              <AnalyticsSkeleton
                title="Anomalies"
                description="Spike and drop detection vs. baseline."
                heightClassName="h-32"
              />
            }
          >
            <AnomaliesPanel workspaceId={workspaceId} range={range} provider={provider} projectId={projectId} />
          </Suspense>
        </div>
      ) : (
        <UpgradeTeaser />
      )}
    </>
  )
}

export { AnalyticsDashboard }
