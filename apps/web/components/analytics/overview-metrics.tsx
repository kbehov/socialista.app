import type { AnalyticsOverviewResponse } from '@socialista/types'

import { formatCount, formatRate, formatSignedCount, trendFromPercent } from '@/utils/format'
import { StatMetric, StatMetrics } from './stat-metric'

export type OverviewMetricsProps = {
  overview: AnalyticsOverviewResponse
  className?: string
}

function OverviewMetrics({ overview, className }: OverviewMetricsProps) {
  const { free, premium } = overview

  if (premium) {
    const { totals, changePercent } = premium
    const showEngagementBreakdown =
      totals.likes !== null ||
      totals.comments !== null ||
      totals.shares !== null ||
      totals.saves !== null
    const showClickMetrics = totals.profileViews !== null || totals.linkClicks !== null

    return (
      <div className={className}>
        <StatMetrics columns={6} size="sm">
          <StatMetric
            label="Engagement"
            value={formatCount(totals.engagement)}
            trend={trendFromPercent(changePercent.engagement)}
          />
          <StatMetric
            label="Impressions"
            value={formatCount(totals.views)}
            trend={trendFromPercent(changePercent.views)}
          />
          <StatMetric
            label="Followers"
            value={formatSignedCount(premium.delta.followers)}
            trend={trendFromPercent(changePercent.followers)}
          />
          <StatMetric
            label="Eng. rate"
            value={formatRate(totals.engagementRate)}
            trend={trendFromPercent(changePercent.engagementRate)}
          />
          <StatMetric label="Reach" value={formatCount(totals.reach)} trend={trendFromPercent(changePercent.reach)} />
          <StatMetric
            label="Published"
            value={formatCount(free.publishedPosts)}
            description={`${formatCount(free.scheduledPosts)} scheduled`}
          />
        </StatMetrics>

        {showEngagementBreakdown ? (
          <StatMetrics columns={4} size="sm" className="mt-2">
            <StatMetric label="Likes" value={formatCount(totals.likes)} trend={trendFromPercent(changePercent.likes)} />
            <StatMetric
              label="Comments"
              value={formatCount(totals.comments)}
              trend={trendFromPercent(changePercent.comments)}
            />
            <StatMetric
              label="Shares"
              value={formatCount(totals.shares)}
              trend={trendFromPercent(changePercent.shares)}
            />
            <StatMetric label="Saves" value={formatCount(totals.saves)} trend={trendFromPercent(changePercent.saves)} />
          </StatMetrics>
        ) : null}

        {showClickMetrics ? (
          <StatMetrics columns={2} size="sm" className="mt-2">
            <StatMetric
              label="Profile visits"
              value={formatCount(totals.profileViews)}
              trend={trendFromPercent(changePercent.profileViews)}
            />
            <StatMetric
              label="Link clicks"
              value={formatCount(totals.linkClicks)}
              trend={trendFromPercent(changePercent.linkClicks)}
            />
          </StatMetrics>
        ) : null}
      </div>
    )
  }

  return (
    <StatMetrics columns={4} size="sm" className={className}>
      <StatMetric
        label="Accounts"
        value={formatCount(free.connectedAccounts)}
        description={
          free.accountsNeedingReauth > 0
            ? `${free.accountsNeedingReauth} need reauth`
            : `${free.accountsByProvider.length} platforms`
        }
      />
      <StatMetric label="Followers" value={formatCount(free.totalFollowers)} />
      <StatMetric label="Scheduled" value={formatCount(free.scheduledPosts)} />
      <StatMetric
        label="Published"
        value={formatCount(free.publishedPosts)}
        description={`${formatCount(free.draftPosts)} drafts`}
      />
    </StatMetrics>
  )
}

export { OverviewMetrics }
