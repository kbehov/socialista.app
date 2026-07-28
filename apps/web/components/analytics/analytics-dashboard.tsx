import { Suspense } from 'react'

import type {
  AnalyticsAccountPerformanceRankBy,
  AnalyticsOverviewResponse,
  AnalyticsRange,
  SocialProvider,
} from '@socialista/types'

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

  return (
    <div className="flex w-full flex-col gap-4 pb-8">
      {platforms.length > 0 ? (
        <PlatformFilter platforms={platforms} active={provider} range={range} rankBy={rankBy} />
      ) : null}

      <OverviewMetrics overview={overview} />

      <Suspense
        fallback={
          <AnalyticsSection title="Usage" description="Plan limits for this workspace." contentClassName="p-0">
            <MetricCardsSkeleton count={4} />
          </AnalyticsSection>
        }
      >
        <UsageStatsPanel workspaceId={workspaceId} />
      </Suspense>

      {isPremium ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,1fr)]">
          <Suspense
            fallback={
              <AnalyticsSkeleton
                title="Growth"
                description="Trends for the selected range."
                heightClassName="h-[220px]"
              />
            }
          >
            <GrowthPanel workspaceId={workspaceId} range={range} provider={provider} />
          </Suspense>

          <Suspense
            fallback={
              <AnalyticsSkeleton title="Platforms" description="Audience by network." heightClassName="h-40" />
            }
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
          <AccountPerformancePanel
            workspaceId={workspaceId}
            range={range}
            rankBy={rankBy}
            provider={provider}
          />
        </Suspense>
      ) : null}

      <Suspense fallback={<AnalyticsSkeleton title="Publishing Activity" heightClassName="h-28" />}>
        <PublishedActivityPanel workspaceId={workspaceId} provider={provider} />
      </Suspense>

      {isPremium ? (
        <>
          <Suspense
            fallback={
              <AnalyticsSkeleton
                title="Platform Breakdown"
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
        </>
      ) : (
        <UpgradeTeaser />
      )}
    </div>
  )
}

export { AnalyticsDashboard }
