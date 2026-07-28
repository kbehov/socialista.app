'use client'

import { CalendarDaysIcon, FlameIcon, SendIcon } from 'lucide-react'

import type { PublishedPostActivityResponse } from '@socialista/types'

import { GithubStats } from './github-stats'
import { formatCount } from './lib/format'

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

function PublishedActivity({ data, className }: PublishedActivityProps) {
  const activeDays = countActiveDays(data.activity)
  const peak = bestDayCount(data.activity)

  return (
    <GithubStats
      className={className}
      compact
      title="Publishing Activity"
      metrics={[
        {
          label: 'Published',
          value: formatCount(data.total),
          icon: <SendIcon />,
        },
        {
          label: 'Active days',
          value: formatCount(activeDays),
          icon: <CalendarDaysIcon />,
        },
        {
          label: 'Best day',
          value: formatCount(peak),
          icon: <FlameIcon />,
          iconClassName: 'text-orange-500',
        },
      ]}
      heatmap={{
        data: data.activity,
        days: data.days,
        endDate: data.end,
        colorScheme: 'green',
        size: 'sm',
        weekStartsOn: 1,
        hideTotal: true,
        showMonthLabels: true,
        showWeekdayLabels: false,
        showLegend: true,
        totalLabel: total =>
          `${total.toLocaleString('en-US')} post${total === 1 ? '' : 's'} in the last year`,
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

export { PublishedActivity }
