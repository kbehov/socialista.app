import { SocialPlatformIcon, getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { dashboardSurface } from '@/components/dashboard/surface'
import { cn } from '@/lib/utils'
import type {
  AnalyticsMetrics,
  AnalyticsOverviewResponse,
  AnalyticsPlatformRow,
  AnalyticsPlatformsResponse,
  SocialProvider,
} from '@socialista/types'

import { formatCount, formatPercent } from '@/utils/format'
import { AnalyticsEmpty } from './analytics-empty'
import { AnalyticsSection } from './analytics-section'

export type PlatformsBreakdownProps = {
  data: AnalyticsPlatformsResponse
  /** Used to always show connected providers when snapshot rows are empty. */
  overview?: AnalyticsOverviewResponse
  /** When set, only this provider row is shown. */
  provider?: SocialProvider | 'all'
  error?: string
  className?: string
}

function emptyMetrics(followers: number | null = null): AnalyticsMetrics {
  return {
    followers,
    following: null,
    posts: null,
    views: null,
    reach: null,
    likes: null,
    comments: null,
    shares: null,
    saves: null,
    profileViews: null,
    linkClicks: null,
    engagement: null,
    engagementRate: null,
  }
}

function emptyChangePercent(): AnalyticsPlatformRow['changePercent'] {
  return {
    followers: null,
    following: null,
    posts: null,
    views: null,
    reach: null,
    likes: null,
    comments: null,
    shares: null,
    saves: null,
    profileViews: null,
    linkClicks: null,
    engagement: null,
    engagementRate: null,
  }
}

function platformsFromOverview(overview: AnalyticsOverviewResponse): AnalyticsPlatformRow[] {
  return overview.free.accountsByProvider.map(row => ({
    provider: row.provider,
    accounts: row.accounts,
    current: emptyMetrics(row.followers),
    previous: emptyMetrics(),
    changePercent: emptyChangePercent(),
  }))
}

function resolvePlatforms(
  data: AnalyticsPlatformsResponse,
  overview: AnalyticsOverviewResponse | undefined,
  provider: SocialProvider | 'all',
): AnalyticsPlatformRow[] {
  const base = data.platforms.length > 0 ? data.platforms : overview ? platformsFromOverview(overview) : []

  if (provider === 'all') return base
  return base.filter(row => row.provider === provider)
}

function changeTone(value: number | null) {
  if (value === null || !Number.isFinite(value) || value === 0) return 'text-muted-foreground'
  return value > 0 ? dashboardSurface.trendUp : dashboardSurface.trendDown
}

function PlatformsBreakdown({ data, overview, provider = 'all', error, className }: PlatformsBreakdownProps) {
  const platforms = resolvePlatforms(data, overview, provider)

  return (
    <AnalyticsSection
      className={cn(className)}
      title="Platform breakdown"
      description="Performance by provider for the selected range."
    >
      {error ? <p className="mb-3 text-xs text-destructive">{error}</p> : null}

      {platforms.length === 0 ? (
        <AnalyticsEmpty title="No platform data yet" description="Metrics appear after accounts sync." />
      ) : (
        <div className="-mx-4 -mb-4 grid gap-px border-t border-border bg-border/30 sm:grid-cols-2 xl:grid-cols-3 dark:bg-border/40">
          {platforms.map(row => (
            <PlatformCard key={row.provider} row={row} />
          ))}
        </div>
      )}
    </AnalyticsSection>
  )
}

function PlatformCard({ row }: { row: AnalyticsPlatformRow }) {
  const metrics = [
    { label: 'Followers', value: row.current.followers, change: row.changePercent.followers },
    { label: 'Reach', value: row.current.reach, change: row.changePercent.reach },
    { label: 'Views', value: row.current.views, change: row.changePercent.views },
    { label: 'Engagement', value: row.current.engagement, change: row.changePercent.engagement },
  ] as const

  return (
    <div className={cn(dashboardSurface.dividerCell, 'flex flex-col gap-3 px-3.5 py-3.5')}>
      <div className="flex items-center gap-2">
        <SocialPlatformIcon provider={row.provider} size={14} className="size-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-foreground">{getSocialPlatformLabel(row.provider)}</p>
          <p className={dashboardSurface.metricMeta}>
            {row.accounts} account{row.accounts === 1 ? '' : 's'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {metrics.map(metric => (
          <div key={metric.label}>
            <p className={dashboardSurface.metricLabel}>{metric.label}</p>
            <p className="mt-0.5 text-[13px] font-medium tabular-nums tracking-[-0.02em] text-foreground">
              {formatCount(metric.value)}
            </p>
            <p className={cn('mt-0.5 text-[11px] font-medium tabular-nums', changeTone(metric.change))}>
              {formatPercent(metric.change)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export { PlatformsBreakdown }
