'use client'

import type { ComponentProps } from 'react'
import type { DayButton } from 'react-day-picker'

import { CalendarDayButton } from '@/components/ui/calendar'
import { toDateKey } from '@/lib/posts/post-display'
import { cn } from '@/lib/utils'
import { formatDayDotCount, getDayPostDotClass } from '@/utils/post-calendar.utils'
import type { Post } from '@socialista/types'

type PostCalendarDayButtonProps = ComponentProps<typeof DayButton> & {
  postsByDate: Map<string, Post[]>
}

export function PostCalendarDayButton({ postsByDate, ...props }: PostCalendarDayButtonProps) {
  const dayPosts = postsByDate.get(toDateKey(props.day.date)) ?? []
  const count = dayPosts.length
  const hasPosts = count > 0
  const isSelected = props.modifiers.selected
  const dots = hasPosts ? formatDayDotCount(count) : 0
  const dotClass = hasPosts ? getDayPostDotClass(dayPosts) : null

  return (
    <div className="relative flex size-full min-w-0 items-center justify-center">
      <CalendarDayButton
        {...props}
        className={cn(
          props.className,
          'aspect-auto h-full max-h-full w-full min-h-0 min-w-0 rounded-md text-[13px] font-medium sm:text-sm',
          'data-[selected-single=true]:bg-foreground data-[selected-single=true]:text-background',
          'data-[selected-single=true]:hover:bg-foreground data-[selected-single=true]:hover:text-background',
          hasPosts && 'pb-2.5',
        )}
      />
      {hasPosts && dotClass ? (
        <span
          className="pointer-events-none absolute inset-x-0 bottom-1 z-10 flex items-center justify-center gap-0.5"
          aria-hidden
        >
          {Array.from({ length: dots }, (_, index) => (
            <span
              key={index}
              className={cn('size-1 rounded-full', isSelected ? 'bg-background' : dotClass)}
            />
          ))}
        </span>
      ) : null}
    </div>
  )
}
