import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'

import { dashboardSurface } from '@/components/dashboard/surface'
import { SocialPlatformIcon } from '@/components/icons/social-platform-icon'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
    iconClassName: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    scoreClassName: 'text-emerald-600 dark:text-emerald-400',
  },
  down: {
    icon: TrendingDownIcon,
    iconClassName: 'bg-red-500/10 text-red-600 dark:text-red-400',
    scoreClassName: 'text-red-600 dark:text-red-400',
  },
}

function rankByLabel(rankBy: AnalyticsAccountPerformanceRankBy): string {
  switch (rankBy) {
    case 'followerGrowthPercent':
      return 'follower growth %'
    case 'engagement':
      return 'engagement'
    case 'reach':
      return 'reach'
    case 'followerGrowth':
    default:
      return 'follower growth'
  }
}

function primaryScore(
  row: AnalyticsAccountPerformanceRow,
  rankBy: AnalyticsAccountPerformanceRankBy,
): string {
  switch (rankBy) {
    case 'followerGrowthPercent':
      return formatPercent(row.followerGrowthPercent)
    case 'engagement':
      return formatCount(row.engagement)
    case 'reach':
      return formatCount(row.reach)
    case 'followerGrowth':
    default:
      return formatSignedCount(row.followerGrowth)
  }
}

function secondaryMeta(
  row: AnalyticsAccountPerformanceRow,
  rankBy: AnalyticsAccountPerformanceRankBy,
): string {
  const parts: string[] = []

  if (rankBy === 'followerGrowth' && row.followerGrowthPercent !== null) {
    parts.push(formatPercent(row.followerGrowthPercent))
  } else if (rankBy === 'followerGrowthPercent' && row.followerGrowth !== null) {
    parts.push(formatSignedCount(row.followerGrowth))
  } else if (rankBy === 'engagement' || rankBy === 'reach') {
    if (row.followerGrowth !== null) {
      parts.push(`${formatSignedCount(row.followerGrowth)} followers`)
    }
  }

  if (rankBy !== 'reach' && row.reach !== null) {
    parts.push(`${formatCount(row.reach)} reach`)
  } else if (rankBy === 'reach' && row.engagement !== null) {
    parts.push(`${formatCount(row.engagement)} eng.`)
  } else if (row.followers !== null) {
    parts.push(`${formatCount(row.followers)} followers`)
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
  const winners = (
    provider === 'all' ? data.winners : data.winners.filter(row => row.account.provider === provider)
  ).slice(0, limit)

  const losers = (
    provider === 'all' ? data.losers : data.losers.filter(row => row.account.provider === provider)
  ).slice(0, limit)

  return (
    <AnalyticsSection
      className={cn(className)}
      title="Top movers"
      description={`Biggest wins and losses by ${rankByLabel(data.rankBy)}.`}
      action={
        <AccountPerformanceMetricToggle rankBy={data.rankBy} range={range} provider={provider} />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <PerformanceColumn tone="up" title="Winning" rows={winners} rankBy={data.rankBy} />
        <PerformanceColumn tone="down" title="Losing" rows={losers} rankBy={data.rankBy} />
      </div>
    </AnalyticsSection>
  )
}

function PerformanceColumn({
  tone,
  title,
  rows,
  rankBy,
}: {
  tone: ColumnTone
  title: string
  rows: AnalyticsAccountPerformanceRow[]
  rankBy: AnalyticsAccountPerformanceRankBy
}) {
  const styles = TONE_STYLES[tone]
  const Icon = styles.icon

  return (
    <div className="min-w-0">
      <div className="mb-2.5 flex items-center gap-2 px-0.5">
        <span className={cn('flex size-6 items-center justify-center rounded-md', styles.iconClassName)}>
          <Icon className="size-3.5" strokeWidth={1.75} />
        </span>
        <p className="text-xs font-medium tracking-tight text-foreground">{title}</p>
        <span className="text-[11px] tabular-nums text-muted-foreground">{rows.length}</span>
      </div>

      {rows.length === 0 ? (
        <div className={cn('flex min-h-28 items-center justify-center', dashboardSurface.insetDashed)}>
          <p className="text-xs text-muted-foreground">No accounts to rank yet.</p>
        </div>
      ) : (
        <ol className="flex flex-col gap-1.5">
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
    <li className={cn('flex items-center gap-2.5 px-3 py-2.5', dashboardSurface.inset)}>
      <span className="w-4 shrink-0 text-center text-[10px] font-medium tabular-nums text-muted-foreground/70">
        {String(rank).padStart(2, '0')}
      </span>

      <div className="relative shrink-0">
        <Avatar size="sm" className="rounded-md after:rounded-md">
          {row.account.avatar ? <AvatarImage src={row.account.avatar} alt={row.account.accountName} /> : null}
          <AvatarFallback className="rounded-md text-[9px] font-medium">
            {getInitials(row.account.accountName)}
          </AvatarFallback>
        </Avatar>
        <span className="absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center overflow-hidden rounded ring-2 ring-background">
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

      <p className={cn('shrink-0 text-sm font-semibold tabular-nums tracking-tight', scoreClassName)}>
        {primaryScore(row, rankBy)}
      </p>
    </li>
  )
}

export { AccountPerformance }
