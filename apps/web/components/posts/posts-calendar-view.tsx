'use client'

import { PostCalendarTimelineItem } from '@/components/posts/post-calendar-timeline-item'
import { EmptyState } from '@/components/common/empty-state'
import { Calendar, CalendarDayButton } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  getPostDisplayDate,
  groupPostsByDateKey,
  isSameCalendarDay,
  toDateKey,
} from '@/lib/post-display'
import { monthKeyToDate } from '@/lib/post-filters'
import { cn } from '@/lib/utils'
import type { AccountSummary, Post, PostStatus } from '@socialista/types'
import { CalendarDaysIcon } from 'lucide-react'
import type { ComponentProps } from 'react'
import { useEffect, useMemo, useState } from 'react'
import type { DayButton } from 'react-day-picker'

type PostsCalendarViewProps = {
  posts: Post[]
  accountsById: Record<string, AccountSummary>
  monthKey: string
  onMonthChange: (monthKey: string) => void
  className?: string
}

type DayTone = {
  cellClass: string
  ringClass: string
  badgeClass: string
}

function getDayPostTone(posts: Post[]): DayTone {
  const statuses = new Set(posts.map(post => post.status))

  if (statuses.has('failed')) {
    return {
      cellClass: 'bg-destructive/14 text-destructive',
      ringClass: 'ring-destructive/25',
      badgeClass: 'bg-destructive text-destructive-foreground',
    }
  }

  if (statuses.has('scheduled') || statuses.has('publishing')) {
    return {
      cellClass: 'bg-sky-500/16 text-sky-950 dark:text-sky-50',
      ringClass: 'ring-sky-500/30',
      badgeClass: 'bg-sky-600 text-white dark:bg-sky-500',
    }
  }

  if (statuses.has('draft')) {
    return {
      cellClass: 'bg-amber-500/14 text-amber-950 dark:text-amber-50',
      ringClass: 'ring-amber-500/28',
      badgeClass: 'bg-amber-600 text-white dark:bg-amber-500',
    }
  }

  if (statuses.has('published')) {
    return {
      cellClass: 'bg-emerald-500/14 text-emerald-950 dark:text-emerald-50',
      ringClass: 'ring-emerald-500/28',
      badgeClass: 'bg-emerald-600 text-white dark:bg-emerald-500',
    }
  }

  return {
    cellClass: 'bg-primary/12 text-foreground',
    ringClass: 'ring-primary/25',
    badgeClass: 'bg-primary text-primary-foreground',
  }
}

function resolveSelectedDay(
  monthDate: Date,
  postsByDate: Map<string, Post[]>,
  preferred?: Date,
): Date {
  if (
    preferred &&
    preferred.getFullYear() === monthDate.getFullYear() &&
    preferred.getMonth() === monthDate.getMonth()
  ) {
    return preferred
  }

  const today = new Date()
  if (
    today.getFullYear() === monthDate.getFullYear() &&
    today.getMonth() === monthDate.getMonth()
  ) {
    return today
  }

  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day)
    if ((postsByDate.get(toDateKey(date))?.length ?? 0) > 0) {
      return date
    }
  }

  return new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
}

function PostCalendarDayButton({
  postsByDate,
  ...props
}: ComponentProps<typeof DayButton> & {
  postsByDate: Map<string, Post[]>
}) {
  const key = toDateKey(props.day.date)
  const dayPosts = postsByDate.get(key) ?? []
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
          hasPosts && !isSelected && 'font-semibold',
          hasPosts && !isSelected && 'ring-1 ring-inset',
          hasPosts && !isSelected && tone?.ringClass,
        )}
      />
      {hasPosts ? (
        <span
          className={cn(
            'pointer-events-none absolute top-0.5 right-0.5 z-10 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none tabular-nums shadow-md ring-2 ring-background',
            isSelected ? 'bg-primary-foreground text-primary' : tone?.badgeClass,
          )}
          aria-hidden
        >
          {count > 9 ? '9+' : count}
        </span>
      ) : null}
    </div>
  )
}

const STATUS_SUMMARY: Array<{ status: PostStatus; label: string; className: string }> = [
  { status: 'scheduled', label: 'scheduled', className: 'text-sky-600 dark:text-sky-400' },
  { status: 'published', label: 'published', className: 'text-emerald-600 dark:text-emerald-400' },
  { status: 'draft', label: 'drafts', className: 'text-amber-600 dark:text-amber-400' },
]

export function PostsCalendarView({
  posts,
  accountsById,
  monthKey,
  onMonthChange,
  className,
}: PostsCalendarViewProps) {
  const monthDate = monthKeyToDate(monthKey)
  const postsByDate = useMemo(() => groupPostsByDateKey(posts), [posts])
  const today = useMemo(() => new Date(), [])

  const [selectedDay, setSelectedDay] = useState<Date>(() =>
    resolveSelectedDay(monthDate, postsByDate),
  )

  useEffect(() => {
    setSelectedDay(current => resolveSelectedDay(monthDate, postsByDate, current))
  }, [monthDate, postsByDate])

  const monthStats = useMemo(() => {
    const counts: Partial<Record<PostStatus, number>> = {}

    for (const post of posts) {
      const date = getPostDisplayDate(post)
      if (date.getFullYear() !== monthDate.getFullYear() || date.getMonth() !== monthDate.getMonth()) {
        continue
      }

      counts[post.status] = (counts[post.status] ?? 0) + 1
    }

    const total = Object.values(counts).reduce((sum, value) => sum + (value ?? 0), 0)
    return { counts, total }
  }, [posts, monthDate])

  const selectedPosts = useMemo(() => {
    if (!selectedDay) return []

    return posts
      .filter(post => isSameCalendarDay(getPostDisplayDate(post), selectedDay))
      .sort((a, b) => getPostDisplayDate(a).getTime() - getPostDisplayDate(b).getTime())
  }, [posts, selectedDay])

  const isSelectedToday = selectedDay ? isSameCalendarDay(selectedDay, today) : false

  const selectedLabel = selectedDay
    ? selectedDay.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })
    : 'Select a day'

  const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div
      className={cn(
        'grid h-full min-h-0 grid-rows-2 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(260px,300px)] lg:grid-rows-none',
        className,
      )}
    >
      <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs">
        <div className="shrink-0 border-b border-border/40 px-3 py-2.5">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <p className="text-sm font-medium text-foreground">{monthLabel}</p>
            {monthStats.total > 0 ? (
              <p className="text-[11px] text-muted-foreground">
                {STATUS_SUMMARY.filter(({ status }) => (monthStats.counts[status] ?? 0) > 0).map(
                  ({ status, label, className: statusClassName }, index) => {
                    const value = monthStats.counts[status] ?? 0

                    return (
                      <span key={status}>
                        {index > 0 ? <span aria-hidden> · </span> : null}
                        <span className={cn('font-semibold tabular-nums', statusClassName)}>{value}</span>{' '}
                        {label}
                      </span>
                    )
                  },
                )}
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">No posts this month</p>
            )}
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1" scrollFade scrollbarGutter>
          <div className="p-2 sm:p-3">
            <Calendar
              mode="single"
              selected={selectedDay}
              onSelect={day => {
                if (day) setSelectedDay(day)
              }}
              month={monthDate}
              onMonthChange={date => {
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                onMonthChange(key)
              }}
              className="w-full max-w-none bg-transparent px-1 pt-1 pb-2 [--cell-size:2.25rem] sm:[--cell-size:2.5rem]"
              classNames={{
                root: '!w-full max-w-none',
                months: 'w-full max-w-none',
                month: 'relative w-full max-w-none gap-2',
                nav: 'absolute inset-x-1 top-1 flex items-center justify-between sm:inset-x-1.5 sm:top-1.5',
                month_caption:
                  'flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)',
                month_grid: 'w-full max-w-none',
                weekdays: 'flex w-full',
                weekday:
                  'flex flex-1 basis-0 items-center justify-center text-xs font-medium text-muted-foreground select-none sm:text-sm',
                week: 'flex w-full [&:not(:first-child)]:mt-1',
                day: 'relative flex flex-1 basis-0 aspect-square min-w-0',
              }}
              components={{
                DayButton: dayProps => (
                  <PostCalendarDayButton {...dayProps} postsByDate={postsByDate} />
                ),
              }}
            />
          </div>
        </ScrollArea>
      </div>

      <div className="flex min-h-0 flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs">
        <div className="shrink-0 border-b border-border/40 px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-foreground">{selectedLabel}</p>
            {isSelectedToday ? (
              <span className="rounded-full bg-primary/12 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                Today
              </span>
            ) : null}
            <span className="text-[11px] text-muted-foreground">
              {selectedPosts.length === 0
                ? '· No posts'
                : `· ${selectedPosts.length} ${selectedPosts.length === 1 ? 'post' : 'posts'}`}
            </span>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1" scrollFade scrollbarGutter>
          <div className="p-2.5 sm:p-3">
            {selectedPosts.length === 0 ? (
              <EmptyState
                icon={CalendarDaysIcon}
                title="No posts this day"
                description={
                  monthStats.total > 0
                    ? 'Pick a colored day on the calendar.'
                    : 'Create a post or adjust your filters.'
                }
                minHeight="sm"
                variant="ghost"
                className="py-6"
                iconClassName="size-8 rounded-lg bg-muted/60 [&_svg]:size-3.5"
              />
            ) : (
              <div className="space-y-0" role="list" aria-label={`Posts for ${selectedLabel}`}>
                {selectedPosts.map((post, index) => (
                  <PostCalendarTimelineItem
                    key={post._id}
                    post={post}
                    account={post.account ?? accountsById[post.accountId]}
                    isLast={index === selectedPosts.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
