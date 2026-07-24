'use client'

import { PostListCard } from '@/components/posts/post-row'
import { EmptyState } from '@/components/common/empty-state'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import {
  getPostDisplayDate,
  groupPostsByDateKey,
  isSameCalendarDay,
  toDateKey,
} from '@/lib/post-display'
import { monthKeyToDate } from '@/lib/post-filters'
import { cn } from '@/lib/utils'
import type { AccountSummary, Post } from '@socialista/types'
import { CalendarDaysIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { useMemo, useState } from 'react'
import type { DayButton } from 'react-day-picker'

type PostsCalendarViewProps = {
  posts: Post[]
  accountsById: Record<string, AccountSummary>
  monthKey: string
  onMonthChange: (monthKey: string) => void
  className?: string
}

function PostCalendarDayButton({
  postsByDate,
  ...props
}: ComponentProps<typeof DayButton> & {
  postsByDate: Map<string, Post[]>
}) {
  const key = toDateKey(props.day.date)
  const count = postsByDate.get(key)?.length ?? 0

  return (
    <div className="relative flex size-full flex-col items-center">
      <CalendarDayButton {...props} className={cn(props.className, count > 0 && 'pb-2')} />
      {count > 0 ? (
        <span className="pointer-events-none absolute bottom-1.5 flex items-center gap-0.5" aria-hidden>
          {Array.from({ length: Math.min(count, 3) }).map((_, index) => (
            <span
              key={index}
              className={cn(
                'size-1 rounded-full',
                props.modifiers.selected ? 'bg-primary-foreground/90' : 'bg-primary/80',
              )}
            />
          ))}
        </span>
      ) : null}
    </div>
  )
}

export function PostsCalendarView({
  posts,
  accountsById,
  monthKey,
  onMonthChange,
  className,
}: PostsCalendarViewProps) {
  const monthDate = monthKeyToDate(monthKey)
  const postsByDate = useMemo(() => groupPostsByDateKey(posts), [posts])

  const [selectedDay, setSelectedDay] = useState<Date | undefined>(() => {
    const today = new Date()
    if (
      today.getFullYear() === monthDate.getFullYear() &&
      today.getMonth() === monthDate.getMonth()
    ) {
      return today
    }
    return new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
  })

  const selectedPosts = useMemo(() => {
    if (!selectedDay) return []
    return posts
      .filter(post => isSameCalendarDay(getPostDisplayDate(post), selectedDay))
      .sort((a, b) => getPostDisplayDate(a).getTime() - getPostDisplayDate(b).getTime())
  }, [posts, selectedDay])

  const selectedLabel = selectedDay
    ? selectedDay.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : 'Select a day'

  return (
    <div className={cn('grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(260px,320px)]', className)}>
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Calendar</p>
            <p className="text-xs text-muted-foreground">Posts grouped by scheduled date</p>
          </div>
          <p className="text-xs tabular-nums text-muted-foreground">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </p>
        </div>
        <div className="flex justify-center p-3 sm:p-4">
          <Calendar
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            month={monthDate}
            onMonthChange={date => {
              const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
              onMonthChange(key)
              setSelectedDay(new Date(date.getFullYear(), date.getMonth(), 1))
            }}
            className="w-full max-w-none [--cell-size:--spacing(9)] sm:[--cell-size:--spacing(10)]"
            classNames={{
              root: 'w-full',
              months: 'w-full',
              month: 'w-full gap-3',
              month_grid: 'w-full',
            }}
            components={{
              DayButton: dayProps => (
                <PostCalendarDayButton {...dayProps} postsByDate={postsByDate} />
              ),
            }}
          />
        </div>
      </div>

      <div className="flex min-h-[280px] flex-col rounded-xl border border-border/80 bg-card shadow-xs">
        <div className="border-b border-border/60 px-4 py-3">
          <p className="text-sm font-medium text-foreground">{selectedLabel}</p>
          <p className="text-xs text-muted-foreground">
            {selectedPosts.length === 0
              ? 'No posts on this day'
              : `${selectedPosts.length} ${selectedPosts.length === 1 ? 'post' : 'posts'}`}
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {selectedPosts.length === 0 ? (
            <EmptyState
              icon={CalendarDaysIcon}
              title="Nothing scheduled"
              description="Pick another day or adjust your filters."
              minHeight="sm"
              variant="ghost"
              className="py-8"
              iconClassName="size-9 rounded-xl bg-muted/60 [&_svg]:size-4"
            />
          ) : (
            selectedPosts.map(post => (
              <PostListCard
                key={post._id}
                post={post}
                account={accountsById[post.accountId]}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}
