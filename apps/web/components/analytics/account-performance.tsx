import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import Link from 'next/link'

import { dashboardSurface } from '@/components/dashboard/surface'
import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { cn } from '@/lib/utils'
import {
  formatCount,
  formatPercent,
  formatSignedCount,
  getInitials,
} from '@/utils/format'
import type {
  AnalyticsAccountPerformanceRankBy,
  AnalyticsAccountPerformanceResponse,
  AnalyticsAccountPerformanceRow,
  AnalyticsRange,
  SocialProvider,
} from '@socialista/types'

import { AccountPerformanceMetricToggle } from './account-performance-metric-toggle'
import { AnalyticsEmpty } from './analytics-empty'
import { AnalyticsSection } from './analytics-section'

export type AccountPerformanceProps = {
  data: AnalyticsAccountPerformanceResponse
  range: AnalyticsRange
  provider?: SocialProvider | 'all'
  className?: string
  limit?: number
}

type ColumnTone = 'up' | 'down'

const TONE_STYLES: Record<
  ColumnTone,
  {
    icon: typeof TrendingUpIcon
    iconClassName: string
    scoreClassName: string
  }
> = {
  up: {
    icon: TrendingUpIcon,
    iconClassName: dashboardSurface.trendUp,
    scoreClassName: dashboardSurface.trendUp,
  },
  down: {
    icon: TrendingDownIcon,
    iconClassName: dashboardSurface.trendDown,
    scoreClassName: dashboardSurface.trendDown,
  },
}

function rankByLabel(rankBy: AnalyticsAccountPerformanceRankBy): string {
  switch (rankBy) {
    case 'followerGrowthPercent':
      return 'follower growth %'
    case 'engagement':
      return 'engagement change'
    case 'reach':
      return 'reach change'
    case 'followerGrowth':
    default:
      return 'follower growth'
  }
}

/** Always show the ranking delta — winners are gains, losers are declines. */
function primaryScore(
  row: AnalyticsAccountPerformanceRow,
  rankBy: AnalyticsAccountPerformanceRankBy,
): string {
  if (rankBy === 'followerGrowthPercent') {
    return formatPercent(row.score)
  }
  return formatSignedCount(row.score)
}

function secondaryMeta(
  row: AnalyticsAccountPerformanceRow,
  rankBy: AnalyticsAccountPerformanceRankBy,
): string {
  const parts: string[] = []

  switch (rankBy) {
    case 'followerGrowth':
      if (row.followerGrowthPercent !== null) parts.push(formatPercent(row.followerGrowthPercent))
      if (row.followers !== null) parts.push(`${formatCount(row.followers)} now`)
      break
    case 'followerGrowthPercent':
      if (row.followerGrowth !== null) parts.push(formatSignedCount(row.followerGrowth))
      if (row.followers !== null) parts.push(`${formatCount(row.followers)} now`)
      break
    case 'engagement':
      if (row.engagement !== null) parts.push(`${formatCount(row.engagement)} this period`)
      if (row.previousEngagement !== null) parts.push(`${formatCount(row.previousEngagement)} prior`)
      break
    case 'reach':
      if (row.reach !== null) parts.push(`${formatCount(row.reach)} this period`)
      if (row.previousReach !== null) parts.push(`${formatCount(row.previousReach)} prior`)
      break
  }

  return parts.join(' · ')
}

function accountHandle(row: AnalyticsAccountPerformanceRow): string | null {
  const username = row.account.username?.trim()
  if (!username) return null
  return username.startsWith('@') ? username : `@${username}`
}

function AccountPerformance({
  data,
  range,
  provider = 'all',
  className,
  limit = 5,
}: AccountPerformanceProps) {
  const scopedWinners =
    provider === 'all' ? data.winners : data.winners.filter(row => row.account.provider === provider)
  const scopedLosers =
    provider === 'all' ? data.losers : data.losers.filter(row => row.account.provider === provider)

  // Defense in depth: winners = score > 0, losers = score < 0, never both.
  const winners = scopedWinners.filter(row => row.score > 0).slice(0, limit)
  const winnerIds = new Set(winners.map(row => row.account.id))
  const losers = scopedLosers
    .filter(row => row.score < 0 && !winnerIds.has(row.account.id))
    .slice(0, limit)

  return (
    <AnalyticsSection
      className={cn(className)}
      title="Top movers"
      description={`Biggest wins and losses by ${rankByLabel(data.rankBy)}.`}
      action={
        <AccountPerformanceMetricToggle rankBy={data.rankBy} range={range} provider={provider} />
      }
    >
      <div className="grid sm:grid-cols-2 sm:divide-x sm:divide-border">
        <PerformanceColumn tone="up" title="Winning" rows={winners} rankBy={data.rankBy} className="sm:pr-6" />
        <PerformanceColumn tone="down" title="Losing" rows={losers} rankBy={data.rankBy} className="max-sm:mt-5 sm:pl-6" />
      </div>
    </AnalyticsSection>
  )
}

function PerformanceColumn({
  tone,
  title,
  rows,
  rankBy,
  className,
}: {
  tone: ColumnTone
  title: string
  rows: AnalyticsAccountPerformanceRow[]
  rankBy: AnalyticsAccountPerformanceRankBy
  className?: string
}) {
  const styles = TONE_STYLES[tone]
  const Icon = styles.icon

  return (
    <div className={cn('min-w-0', className)}>
      <div className="mb-3 flex items-center gap-1.5">
        <Icon className={cn('size-3.5 shrink-0', styles.iconClassName)} strokeWidth={1.75} />
        <p className="text-[13px] font-medium text-foreground">{title}</p>
        <span className="text-[11px] tabular-nums text-muted-foreground">{rows.length}</span>
      </div>

      {rows.length === 0 ? (
        <AnalyticsEmpty
          title={tone === 'up' ? 'No gains this period' : 'No declines this period'}
          description={
            tone === 'up' ? 'Gains will show up here once accounts grow.' : 'Quiet period — nothing dropped.'
          }
        />
      ) : (
        <ol className="flex flex-col">
          {rows.map((row, index) => (
            <PerformanceRow
              key={`${tone}-${row.account.id}`}
              row={row}
              rank={index + 1}
              rankBy={rankBy}
              scoreClassName={styles.scoreClassName}
            />
          ))}
        </ol>
      )}
    </div>
  )
}

function PerformanceRow({
  row,
  rank,
  rankBy,
  scoreClassName,
}: {
  row: AnalyticsAccountPerformanceRow
  rank: number
  rankBy: AnalyticsAccountPerformanceRankBy
  scoreClassName: string
}) {
  const handle = accountHandle(row)
  const meta = secondaryMeta(row, rankBy)

  return (
    <li>
      <Link
        href={DASHBOARD_ROUTES.accountAnalytics(row.account.id)}
        className={cn(
          'flex items-center gap-2.5 rounded-md px-1 py-1.5 -mx-1',
          'transition-colors hover:bg-highlight',
        )}
      >
        <span className="w-5 shrink-0 text-[11px] tabular-nums text-muted-foreground">
          {String(rank).padStart(2, '0')}
        </span>

        <div className="relative shrink-0">
          <Avatar size="sm" className="rounded-lg after:rounded-lg">
            {row.account.avatar ? <AvatarImage src={row.account.avatar} alt={row.account.accountName} /> : null}
            <AvatarFallback className="rounded-lg text-[9px] font-medium">
              {getInitials(row.account.accountName)}
            </AvatarFallback>
          </Avatar>
          <span className="absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center overflow-hidden rounded-md ring-2 ring-background">
            <SocialPlatformIcon provider={row.account.provider} size={10} className="size-3.5 rounded" />
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium text-foreground">{row.account.accountName}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {handle ?? meta}
            {handle && meta ? ` · ${meta}` : null}
          </p>
        </div>

        <p className={cn('shrink-0 text-sm font-medium tabular-nums tracking-[-0.02em]', scoreClassName)}>
          {primaryScore(row, rankBy)}
        </p>
      </Link>
    </li>
  )
}

export { AccountPerformance }
