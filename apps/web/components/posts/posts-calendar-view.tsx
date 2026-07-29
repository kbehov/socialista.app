'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDaysIcon } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'
import { PostCalendarDayButton } from '@/components/posts/post-calendar-day-button'
import { PostCalendarTimelineItem } from '@/components/posts/post-calendar-timeline-item'
import { CALENDAR_MONTH_STATUS_SUMMARY } from '@/components/posts/post-meta'
import { PostStatusCountsText } from '@/components/posts/post-status-counts-text'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { groupPostsByDateKey, isSameCalendarDay, resolvePostAccount } from '@/lib/post-display'
import { dateToMonthKey, monthKeyToDate } from '@/lib/post-filters'
import { cn } from '@/lib/utils'
import {
  getMonthPostStatusCounts,
  getPostsForCalendarDay,
  resolveSelectedCalendarDay,
} from '@/utils/post-calendar.utils'
import { pluralizePosts } from '@/utils/post.utils'
import type { AccountSummary, Post, PostStatus } from '@socialista/types'

type PostsCalendarViewProps = {
  posts: Post[]
  accountsById: Record<string, AccountSummary>
  monthKey: string
  onMonthChange: (monthKey: string) => void
  className?: string
}

const calendarClassNames = {
  root: '!w-full max-w-none',
  months: 'w-full max-w-none',
  month: 'relative w-full max-w-none gap-2',
  nav: 'absolute inset-x-1 top-1 flex items-center justify-between sm:inset-x-1.5 sm:top-1.5',
  month_caption: 'flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)',
  month_grid: 'w-full max-w-none',
  weekdays: 'flex w-full',
  weekday:
    'flex flex-1 basis-0 items-center justify-center text-xs font-medium text-muted-foreground select-none sm:text-sm',
  week: 'flex w-full [&:not(:first-child)]:mt-1',
  day: 'relative flex flex-1 basis-0 aspect-square min-w-0',
} as const

function useSelectedCalendarDay(monthDate: Date, postsByDate: Map<string, Post[]>) {
  const [selectedDay, setSelectedDay] = useState(() =>
    resolveSelectedCalendarDay(monthDate, postsByDate),
  )

  useEffect(() => {
    setSelectedDay(current => resolveSelectedCalendarDay(monthDate, postsByDate, current))
  }, [monthDate, postsByDate])

  return [selectedDay, setSelectedDay] as const
}

function CalendarMonthPanel({
  monthDate,
  monthLabel,
  monthStats,
  selectedDay,
  postsByDate,
  onSelectDay,
  onMonthChange,
}: {
  monthDate: Date
  monthLabel: string
  monthStats: { counts: Partial<Record<PostStatus, number>>; total: number }
  selectedDay: Date
  postsByDate: Map<string, Post[]>
  onSelectDay: (day: Date) => void
  onMonthChange: (monthKey: string) => void
}) {
  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="shrink-0 border-b border-border/40 px-4 py-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">{monthLabel}</p>
          {monthStats.total > 0 ? (
            <PostStatusCountsText
              counts={monthStats.counts}
              summary={CALENDAR_MONTH_STATUS_SUMMARY}
            />
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
              if (day) onSelectDay(day)
            }}
            month={monthDate}
            onMonthChange={date => onMonthChange(dateToMonthKey(date))}
            className="w-full max-w-none bg-transparent px-1 pt-1 pb-2 [--cell-size:2.25rem] sm:[--cell-size:2.5rem]"
            classNames={calendarClassNames}
            components={{
              DayButton: dayProps => (
                <PostCalendarDayButton {...dayProps} postsByDate={postsByDate} />
              ),
            }}
          />
        </div>
      </ScrollArea>
    </div>
  )
}

function CalendarDayDetailPanel({
  selectedDay,
  selectedPosts,
  accountsById,
  hasMonthPosts,
}: {
  selectedDay: Date
  selectedPosts: Post[]
  accountsById: Record<string, AccountSummary>
  hasMonthPosts: boolean
}) {
  const today = useMemo(() => new Date(), [])
  const isToday = isSameCalendarDay(selectedDay, today)
  const selectedLabel = selectedDay.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-border/50 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
      <div className="shrink-0 border-b border-border/40 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">{selectedLabel}</p>
          {isToday ? (
            <span className="rounded-full bg-foreground px-2 py-0.5 text-[10px] font-semibold tracking-wide text-background uppercase">
              Today
            </span>
          ) : null}
          <span className="text-[11px] tabular-nums tracking-tight text-muted-foreground">
            {selectedPosts.length === 0 ? '· Empty' : `· ${pluralizePosts(selectedPosts.length)}`}
          </span>
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1" scrollFade scrollbarGutter>
        <div className="p-3 sm:p-3.5">
          {selectedPosts.length === 0 ? (
            <EmptyState
              icon={CalendarDaysIcon}
              title="Nothing scheduled"
              description={
                hasMonthPosts
                  ? 'Pick a highlighted day to see what’s planned.'
                  : 'Create a post or loosen your filters.'
              }
              minHeight="sm"
              variant="ghost"
              className="py-8"
              iconClassName="size-9 rounded-xl border border-border/50 bg-muted/40 shadow-xs [&_svg]:size-3.5"
            />
          ) : (
            <div className="space-y-0" role="list" aria-label={`Posts for ${selectedLabel}`}>
              {selectedPosts.map((post, index) => (
                <PostCalendarTimelineItem
                  key={post._id}
                  post={post}
                  account={resolvePostAccount(post, accountsById)}
                  isLast={index === selectedPosts.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
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
  const monthStats = useMemo(() => getMonthPostStatusCounts(posts, monthDate), [posts, monthDate])
  const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const [selectedDay, setSelectedDay] = useSelectedCalendarDay(monthDate, postsByDate)
  const selectedPosts = useMemo(
    () => getPostsForCalendarDay(posts, selectedDay),
    [posts, selectedDay],
  )

  return (
    <div
      className={cn(
        'grid h-full min-h-0 grid-rows-2 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(280px,320px)] lg:grid-rows-none',
        className,
      )}
    >
      <CalendarMonthPanel
        monthDate={monthDate}
        monthLabel={monthLabel}
        monthStats={monthStats}
        selectedDay={selectedDay}
        postsByDate={postsByDate}
        onSelectDay={setSelectedDay}
        onMonthChange={onMonthChange}
      />
      <CalendarDayDetailPanel
        selectedDay={selectedDay}
        selectedPosts={selectedPosts}
        accountsById={accountsById}
        hasMonthPosts={monthStats.total > 0}
      />
    </div>
  )
}
