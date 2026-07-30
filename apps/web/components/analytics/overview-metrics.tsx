import {
  BookmarkIcon,
  CalendarClockIcon,
  EyeIcon,
  FlameIcon,
  HeartIcon,
  Link2Icon,
  MessageCircleIcon,
  MousePointerClickIcon,
  SendIcon,
  Share2Icon,
  TargetIcon,
  ThumbsUpIcon,
  UserRoundSearchIcon,
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
            icon={<FlameIcon />}
            iconClassName="text-orange-500"
            trend={trendFromPercent(changePercent.engagement)}
          />
          <StatMetric
            label="Impressions"
            value={formatCount(totals.views)}
            icon={<EyeIcon />}
            trend={trendFromPercent(changePercent.views)}
          />
          <StatMetric
            label="Followers"
            value={formatSignedCount(premium.delta.followers)}
            icon={<UsersIcon />}
            trend={trendFromPercent(changePercent.followers)}
          />
          <StatMetric
            label="Eng. rate"
            value={formatRate(totals.engagementRate)}
            icon={<ThumbsUpIcon />}
            trend={trendFromPercent(changePercent.engagementRate)}
          />
          <StatMetric
            label="Reach"
            value={formatCount(totals.reach)}
            icon={<TargetIcon />}
            trend={trendFromPercent(changePercent.reach)}
          />
          <StatMetric
            label="Published"
            value={formatCount(free.publishedPosts)}
            icon={<SendIcon />}
            description={`${formatCount(free.scheduledPosts)} scheduled`}
          />
        </StatMetrics>

        {showEngagementBreakdown ? (
          <StatMetrics columns={4} size="sm" className="mt-4">
            <StatMetric
              label="Likes"
              value={formatCount(totals.likes)}
              icon={<HeartIcon />}
              trend={trendFromPercent(changePercent.likes)}
            />
            <StatMetric
              label="Comments"
              value={formatCount(totals.comments)}
              icon={<MessageCircleIcon />}
              trend={trendFromPercent(changePercent.comments)}
            />
            <StatMetric
              label="Shares"
              value={formatCount(totals.shares)}
              icon={<Share2Icon />}
              trend={trendFromPercent(changePercent.shares)}
            />
            <StatMetric
              label="Saves"
              value={formatCount(totals.saves)}
              icon={<BookmarkIcon />}
              trend={trendFromPercent(changePercent.saves)}
            />
          </StatMetrics>
        ) : null}

        {showClickMetrics ? (
          <StatMetrics columns={2} size="sm" className="mt-4">
            <StatMetric
              label="Profile visits"
              value={formatCount(totals.profileViews)}
              icon={<UserRoundSearchIcon />}
              trend={trendFromPercent(changePercent.profileViews)}
            />
            <StatMetric
              label="Link clicks"
              value={formatCount(totals.linkClicks)}
              icon={<MousePointerClickIcon />}
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
