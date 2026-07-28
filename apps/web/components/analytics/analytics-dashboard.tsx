import { Suspense } from 'react'

import type { AnalyticsOverviewResponse, AnalyticsRange, SocialProvider } from '@socialista/types'

import { AnalyticsSkeleton } from './analytics-skeleton'
import { OverviewMetrics } from './overview-metrics'
import { PlatformFilter } from './platform-filter'
import { AnomaliesPanel, GrowthPanel, PlatformSummaryPanel, PlatformsPanel } from './premium-panels'
import { PublishedActivityPanel } from './published-activity-panel'
import { UpgradeTeaser } from './upgrade-teaser'

export type AnalyticsDashboardProps = {
  workspaceId: string
  overview: AnalyticsOverviewResponse
  range: AnalyticsRange
  provider?: SocialProvider | 'all'
}

function AnalyticsDashboard({ workspaceId, overview, range, provider = 'all' }: AnalyticsDashboardProps) {
  const isPremium = overview.tier === 'premium'
  const platforms = overview.free.accountsByProvider.map(row => ({
    provider: row.provider,
    accounts: row.accounts,
  }))

  return (
    <div className="flex w-full flex-col gap-4 pb-6">
      {platforms.length > 0 ? <PlatformFilter platforms={platforms} active={provider} range={range} /> : null}

      <OverviewMetrics overview={overview} />

      {isPremium ? (
        <div className="grid gap-3 xl:grid-cols-[minmax(0,1.65fr)_minmax(260px,1fr)]">
          <Suspense
            fallback={
              <AnalyticsSkeleton
                title="Growth"
                description="Trends for the selected range."
                heightClassName="h-[200px]"
              />
            }
          >
            <GrowthPanel workspaceId={workspaceId} range={range} provider={provider} />
          </Suspense>

          <Suspense
            fallback={<AnalyticsSkeleton title="Platforms" description="Audience by network." heightClassName="h-36" />}
          >
            <PlatformSummaryPanel workspaceId={workspaceId} range={range} overview={overview} provider={provider} />
          </Suspense>
        </div>
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
              <AnalyticsSkeleton title="Anomalies" description="Spike and drop detection." heightClassName="h-32" />
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
