'use client'

import type { ComponentProps } from 'react'
import type { DayButton } from 'react-day-picker'

import { CalendarDayButton } from '@/components/ui/calendar'
import { toDateKey } from '@/lib/post-display'
import { cn } from '@/lib/utils'
import { formatDayBadgeCount, getDayPostTone } from '@/utils/post-calendar.utils'
import type { Post } from '@socialista/types'

type PostCalendarDayButtonProps = ComponentProps<typeof DayButton> & {
  postsByDate: Map<string, Post[]>
}

export function PostCalendarDayButton({ postsByDate, ...props }: PostCalendarDayButtonProps) {
  const dayPosts = postsByDate.get(toDateKey(props.day.date)) ?? []
  const count = dayPosts.length
  const hasPosts = count > 0
  const isSelected = props.modifiers.selected
  const tone = hasPosts ? getDayPostTone(dayPosts) : null

  return (
    <div className="relative flex size-full min-w-0 items-center justify-center">
      <CalendarDayButton
        {...props}
        className={cn(
          props.className,
          'size-full min-h-0 min-w-0 rounded-md text-sm font-medium sm:text-base',
          hasPosts && !isSelected && tone?.cellClass,
          hasPosts && !isSelected && 'font-semibold ring-1 ring-inset',
          hasPosts && !isSelected && tone?.ringClass,
        )}
      />
      {hasPosts ? (
        <span
          className={cn(
            'pointer-events-none absolute top-0.5 right-0.5 z-10 flex h-4 min-w-4 items-center justify-center rounded-full px-1',
            'text-[9px] font-semibold leading-none tabular-nums ring-2 ring-background',
            isSelected ? 'bg-primary-foreground text-primary' : tone?.badgeClass,
          )}
          aria-hidden
        >
          {formatDayBadgeCount(count)}
        </span>
      ) : null}
    </div>
  )
}
