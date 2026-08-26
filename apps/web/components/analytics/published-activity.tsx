'use client'

import type { PublishedPostActivityResponse } from '@socialista/types'

import { formatCount } from '@/utils/format'
import { GithubStats } from './github-stats'

/** Assumed minutes saved per published post vs. manual publishing. */
const MINUTES_PER_POST = 3

export type PublishedActivityProps = {
  data: PublishedPostActivityResponse
  className?: string
}

function countActiveDays(activity: PublishedPostActivityResponse['activity']): number {
  let active = 0
  for (const day of activity) {
    if (day.count > 0) active += 1
  }
  return active
}

function bestDayCount(activity: PublishedPostActivityResponse['activity']): number {
  let best = 0
  for (const day of activity) {
    if (day.count > best) best = day.count
  }
  return best
}

function formatTimeSaved(posts: number): string | null {
  const minutes = posts * MINUTES_PER_POST
  if (minutes <= 0) return null

  if (minutes < 60) {
    return `~${minutes}m saved vs. posting by hand`
  }

  const hours = minutes / 60
  const rounded = hours >= 10 ? Math.round(hours) : Math.round(hours * 10) / 10
  const display = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)

  return `~${display}h saved vs. posting by hand`
}

function PublishedActivity({ data, className }: PublishedActivityProps) {
  const activeDays = countActiveDays(data.activity)
  const peak = bestDayCount(data.activity)
  const timeSaved = formatTimeSaved(data.total)

  return (
    <GithubStats
      className={className}
      compact
      title="Publishing activity"
      action={
        timeSaved ? (
          <span className="text-[11px] text-muted-foreground">{timeSaved}</span>
        ) : null
      }
      metrics={[
        {
          label: 'Published',
          value: formatCount(data.total),
        },
        {
          label: 'Active days',
          value: formatCount(activeDays),
        },
        {
          label: 'Best day',
          value: formatCount(peak),
        },
      ]}
      heatmap={{
        data: data.activity,
        days: data.days,
        endDate: data.end,
        colorScheme: 'neutral',
        size: 'sm',
        weekStartsOn: 1,
        hideTotal: true,
        showMonthLabels: true,
        showWeekdayLabels: false,
        showLegend: true,
        totalLabel: total => `${total.toLocaleString('en-US')} post${total === 1 ? '' : 's'} in the last year`,
        lessLabel: 'Less',
        moreLabel: 'More',
        renderTooltip: ({ date, count }) => {
          if (count === 0) return `No posts on ${date}`
          if (count === 1) return `1 post on ${date}`
          return `${count.toLocaleString('en-US')} posts on ${date}`
        },
      }}
    />
  )
}

export { PublishedActivity, formatTimeSaved }
