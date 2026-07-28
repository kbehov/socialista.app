import {
  CalendarClockIcon,
  EyeIcon,
  FlameIcon,
  Link2Icon,
  SendIcon,
  TargetIcon,
  ThumbsUpIcon,
  UsersIcon,
} from 'lucide-react'

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
    return (
      <StatMetrics columns={6} size="sm" className={className}>
        <StatMetric
          label="Engagement"
          value={formatCount(premium.totals.engagement)}
          icon={<FlameIcon />}
          iconClassName="text-orange-500"
          trend={trendFromPercent(premium.changePercent.engagement)}
        />
        <StatMetric
          label="Impressions"
          value={formatCount(premium.totals.views)}
          icon={<EyeIcon />}
          trend={trendFromPercent(premium.changePercent.views)}
        />
        <StatMetric
          label="Followers"
          value={formatSignedCount(premium.delta.followers)}
          icon={<UsersIcon />}
          trend={trendFromPercent(premium.changePercent.followers)}
        />
        <StatMetric
          label="Eng. rate"
          value={formatRate(premium.totals.engagementRate)}
          icon={<ThumbsUpIcon />}
          trend={trendFromPercent(premium.changePercent.engagementRate)}
        />
        <StatMetric
          label="Reach"
          value={formatCount(premium.totals.reach)}
          icon={<TargetIcon />}
          trend={trendFromPercent(premium.changePercent.reach)}
        />
        <StatMetric
          label="Published"
          value={formatCount(free.publishedPosts)}
          icon={<SendIcon />}
          description={`${formatCount(free.scheduledPosts)} scheduled`}
        />
      </StatMetrics>
    )
  }

  return (
    <StatMetrics columns={4} size="sm" className={className}>
      <StatMetric
        label="Accounts"
        value={formatCount(free.connectedAccounts)}
        icon={<Link2Icon />}
        description={
          free.accountsNeedingReauth > 0
            ? `${free.accountsNeedingReauth} need reauth`
            : `${free.accountsByProvider.length} platforms`
        }
      />
      <StatMetric label="Followers" value={formatCount(free.totalFollowers)} icon={<UsersIcon />} />
      <StatMetric label="Scheduled" value={formatCount(free.scheduledPosts)} icon={<CalendarClockIcon />} />
      <StatMetric
        label="Published"
        value={formatCount(free.publishedPosts)}
        icon={<SendIcon />}
        description={`${formatCount(free.draftPosts)} drafts`}
      />
    </StatMetrics>
  )
}

export { OverviewMetrics }
