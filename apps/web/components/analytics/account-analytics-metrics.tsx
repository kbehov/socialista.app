import {
  BookmarkIcon,
  EyeIcon,
  FlameIcon,
  HeartIcon,
  MessageCircleIcon,
  SendIcon,
  Share2Icon,
  TargetIcon,
  ThumbsUpIcon,
  UsersIcon,
} from 'lucide-react'

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

  return (
    <div className={className}>
      <StatMetrics columns={6} size="sm">
        <StatMetric
          label="Engagement"
          value={formatCount(current.engagement)}
          icon={<FlameIcon />}
          iconClassName="text-orange-500"
          trend={trendFromPercent(changePercent.engagement)}
        />
        <StatMetric
          label="Impressions"
          value={formatCount(current.views)}
          icon={<EyeIcon />}
          trend={trendFromPercent(changePercent.views)}
        />
        <StatMetric
          label="Followers"
          value={formatSignedCount(delta.followers)}
          icon={<UsersIcon />}
          trend={trendFromPercent(changePercent.followers)}
          description={current.followers !== null ? `${formatCount(current.followers)} total` : undefined}
        />
        <StatMetric
          label="Eng. rate"
          value={formatRate(current.engagementRate)}
          icon={<ThumbsUpIcon />}
          trend={trendFromPercent(changePercent.engagementRate)}
        />
        <StatMetric
          label="Reach"
          value={formatCount(current.reach)}
          icon={<TargetIcon />}
          trend={trendFromPercent(changePercent.reach)}
        />
        <StatMetric
          label="Posts"
          value={formatCount(current.posts)}
          icon={<SendIcon />}
          trend={trendFromPercent(changePercent.posts)}
        />
      </StatMetrics>

      {showEngagementBreakdown ? (
        <StatMetrics columns={4} size="sm" className="mt-4">
          <StatMetric
            label="Likes"
            value={formatCount(current.likes)}
            icon={<HeartIcon />}
            trend={trendFromPercent(changePercent.likes)}
          />
          <StatMetric
            label="Comments"
            value={formatCount(current.comments)}
            icon={<MessageCircleIcon />}
            trend={trendFromPercent(changePercent.comments)}
          />
          <StatMetric
            label="Shares"
            value={formatCount(current.shares)}
            icon={<Share2Icon />}
            trend={trendFromPercent(changePercent.shares)}
          />
          <StatMetric
            label="Saves"
            value={formatCount(current.saves)}
            icon={<BookmarkIcon />}
            trend={trendFromPercent(changePercent.saves)}
          />
        </StatMetrics>
      ) : null}
    </div>
  )
}

export { AccountAnalyticsMetrics }
