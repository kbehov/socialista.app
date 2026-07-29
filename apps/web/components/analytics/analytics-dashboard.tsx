import { Suspense } from 'react'

import type {
  AnalyticsAccountPerformanceRankBy,
  AnalyticsOverviewResponse,
  AnalyticsRange,
  SocialProvider,
} from '@socialista/types'

import RefreshButton from '../common/refresh-button'
import { AnalyticsExportCsvButton } from './analytics-export-csv-button'
import { AnalyticsSection } from './analytics-section'
import { AnalyticsSkeleton, MetricCardsSkeleton } from './analytics-skeleton'
import { OverviewMetrics } from './overview-metrics'
import { AccountPerformancePanel } from './panels/account-performance-panel'
import { AnomaliesPanel } from './panels/anomalies-panel'
import { GrowthPanel } from './panels/growth-panel'
import { PlatformSummaryPanel } from './panels/platform-summary-panel'
import { PlatformsPanel } from './panels/platforms-panel'
import { PublishedActivityPanel } from './panels/published-activity-panel'
import { UsageStatsPanel } from './panels/usage-stats-panel'
import { PlatformFilter } from './platform-filter'
import { UpgradeTeaser } from './upgrade-teaser'
export type AnalyticsDashboardProps = {
  workspaceId: string
  overview: AnalyticsOverviewResponse
  range: AnalyticsRange
  rankBy?: AnalyticsAccountPerformanceRankBy
  provider?: SocialProvider | 'all'
}

function AnalyticsDashboard({
  workspaceId,
  overview,
  range,
  rankBy = 'followerGrowth',
  provider = 'all',
}: AnalyticsDashboardProps) {
  const isPremium = overview.tier === 'premium'
  const platforms = overview.free.accountsByProvider.map(row => ({
    provider: row.provider,
    accounts: row.accounts,
  }))
  const showToolbar = platforms.length > 0 || isPremium

  return (
    <div className="flex w-full flex-col gap-5 pb-10">
      {/* Controls — filter + export */}
      {showToolbar ? (
        <div className="flex flex-wrap items-center gap-2.5">
          {platforms.length > 0 ? (
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
          {isPremium ? <AnalyticsExportCsvButton workspaceId={workspaceId} range={range} /> : null}
        </div>
      ) : null}

      {/* Hero metrics */}
      <OverviewMetrics overview={overview} />

      {/* Workspace capacity */}
      <Suspense
        fallback={
          <AnalyticsSection title="Usage" description="How this workspace uses plan limits." contentClassName="p-0">
            <MetricCardsSkeleton count={4} />
          </AnalyticsSection>
        }
      >
        <UsageStatsPanel workspaceId={workspaceId} />
      </Suspense>

      {/* Premium insight grid */}
      {isPremium ? (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
          <Suspense
            fallback={
              <AnalyticsSkeleton
                title="Growth"
                description="Audience and engagement over time."
                heightClassName="h-[220px]"
              />
            }
          >
            <GrowthPanel workspaceId={workspaceId} range={range} provider={provider} />
          </Suspense>

          <Suspense
            fallback={<AnalyticsSkeleton title="Platforms" description="Audience by network." heightClassName="h-40" />}
          >
            <PlatformSummaryPanel workspaceId={workspaceId} range={range} overview={overview} provider={provider} />
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
          <AccountPerformancePanel workspaceId={workspaceId} range={range} rankBy={rankBy} provider={provider} />
        </Suspense>
      ) : null}

      <Suspense fallback={<AnalyticsSkeleton title="Publishing activity" heightClassName="h-28" />}>
        <PublishedActivityPanel workspaceId={workspaceId} provider={provider} />
      </Suspense>

      {isPremium ? (
        <div className="flex flex-col gap-5">
          <Suspense
            fallback={
              <AnalyticsSkeleton
                title="Platform breakdown"
                description="Performance by provider."
                heightClassName="h-40"
              />
            }
          >
            <PlatformsPanel workspaceId={workspaceId} range={range} overview={overview} provider={provider} />
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
            <AnomaliesPanel workspaceId={workspaceId} range={range} provider={provider} />
          </Suspense>
        </div>
      ) : (
        <UpgradeTeaser />
      )}
    </div>
  )
}

export { AnalyticsDashboard }
