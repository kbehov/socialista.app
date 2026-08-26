import type { AccountAnalyticsResponse } from '@socialista/types'

import { formatCount, formatRate, formatSignedCount, trendFromPercent } from '@/utils/format'
import { StatMetric, StatMetrics } from './stat-metric'

export type AccountAnalyticsMetricsProps = {
  data: AccountAnalyticsResponse
  className?: string
}

function AccountAnalyticsMetrics({ data, className }: AccountAnalyticsMetricsProps) {
  const { current, delta, changePercent } = data
  const showEngagementBreakdown =
    current.likes !== null ||
    current.comments !== null ||
    current.shares !== null ||
    current.saves !== null
  const showClickMetrics = current.profileViews !== null || current.linkClicks !== null

  return (
    <div className={className}>
      <StatMetrics columns={6} size="sm">
        <StatMetric
          label="Engagement"
          value={formatCount(current.engagement)}
          trend={trendFromPercent(changePercent.engagement)}
        />
        <StatMetric
          label="Impressions"
          value={formatCount(current.views)}
          trend={trendFromPercent(changePercent.views)}
        />
        <StatMetric
          label="Followers"
          value={formatSignedCount(delta.followers)}
          trend={trendFromPercent(changePercent.followers)}
          description={current.followers !== null ? `${formatCount(current.followers)} total` : undefined}
        />
        <StatMetric
          label="Eng. rate"
          value={formatRate(current.engagementRate)}
          trend={trendFromPercent(changePercent.engagementRate)}
        />
        <StatMetric label="Reach" value={formatCount(current.reach)} trend={trendFromPercent(changePercent.reach)} />
        <StatMetric label="Posts" value={formatCount(current.posts)} trend={trendFromPercent(changePercent.posts)} />
      </StatMetrics>

      {showEngagementBreakdown ? (
        <StatMetrics columns={4} size="sm" className="mt-3">
          <StatMetric label="Likes" value={formatCount(current.likes)} trend={trendFromPercent(changePercent.likes)} />
          <StatMetric
            label="Comments"
            value={formatCount(current.comments)}
            trend={trendFromPercent(changePercent.comments)}
          />
          <StatMetric
            label="Shares"
            value={formatCount(current.shares)}
            trend={trendFromPercent(changePercent.shares)}
          />
          <StatMetric label="Saves" value={formatCount(current.saves)} trend={trendFromPercent(changePercent.saves)} />
        </StatMetrics>
      ) : null}

      {showClickMetrics ? (
        <StatMetrics columns={2} size="sm" className="mt-3">
          <StatMetric
            label="Profile visits"
            value={formatCount(current.profileViews)}
            trend={trendFromPercent(changePercent.profileViews)}
          />
          <StatMetric
            label="Link clicks"
            value={formatCount(current.linkClicks)}
            trend={trendFromPercent(changePercent.linkClicks)}
          />
        </StatMetrics>
      ) : null}
    </div>
  )
}

export { AccountAnalyticsMetrics }
