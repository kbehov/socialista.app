'use client'

import { CalendarDaysIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useMemo, useState } from 'react'

import { EmptyState } from '@/components/common/empty-state'
import { dashboardSurface } from '@/components/dashboard/surface'
import { PostCalendarDayButton } from '@/components/posts/post-calendar-day-button'
import { PostCalendarTimelineItem } from '@/components/posts/post-calendar-timeline-item'
import { CALENDAR_MONTH_STATUS_SUMMARY } from '@/components/posts/post-meta'
import { PostStatusCountsText } from '@/components/posts/post-status-counts-text'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { groupPostsByDateKey, isSameCalendarDay, resolvePostAccount } from '@/lib/posts/post-display'
import { dateToMonthKey, monthKeyToDate } from '@/lib/posts/post-filters'
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
  month: 'relative w-full max-w-none gap-3',
  nav: 'hidden',
  month_caption: 'hidden',
  month_grid: 'w-full max-w-none',
  weekdays: 'flex w-full',
  weekday:
    'flex flex-1 basis-0 items-center justify-center text-[11px] font-medium text-muted-foreground normal-case select-none sm:text-xs',
  week: 'flex w-full [&:not(:first-child)]:mt-1.5',
  day: 'relative flex flex-1 basis-0 aspect-square min-w-0',
} as const

function formatWeekdayName(date: Date) {
  return date.toLocaleDateString('en-US', { weekday: 'short' })
}

function useSelectedCalendarDay(monthDate: Date, postsByDate: Map<string, Post[]>) {
  const [preferredDay, setPreferredDay] = useState<Date | undefined>(undefined)
  const selectedDay = resolveSelectedCalendarDay(monthDate, postsByDate, preferredDay)
  return [selectedDay, setPreferredDay] as const
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
    <div className="flex min-h-0 flex-col">
      <div className="px-1">
        <div className="flex items-center gap-1.5">
          <h2 className={cn(dashboardSurface.sectionTitle, 'min-w-0 truncate text-[15px]')}>{monthLabel}</h2>
          <div className="flex shrink-0 items-center">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Previous month"
              onClick={() =>
                onMonthChange(dateToMonthKey(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1)))
              }
            >
              <ChevronLeftIcon className="size-4" strokeWidth={1.75} />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              aria-label="Next month"
              onClick={() =>
                onMonthChange(dateToMonthKey(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1)))
              }
            >
              <ChevronRightIcon className="size-4" strokeWidth={1.75} />
            </Button>
          </div>
        </div>
        <p className="mt-1 text-[12px] leading-snug text-muted-foreground">
          {monthStats.total > 0 ? (
            <PostStatusCountsText counts={monthStats.counts} summary={CALENDAR_MONTH_STATUS_SUMMARY} />
          ) : (
            'No posts this month'
          )}
        </p>
      </div>

      <div className="min-h-0 flex-1 pt-3">
        <Calendar
          mode="single"
          selected={selectedDay}
          onSelect={day => {
            if (day) onSelectDay(day)
          }}
          month={monthDate}
          onMonthChange={date => onMonthChange(dateToMonthKey(date))}
          formatters={{ formatWeekdayName }}
          className="w-full max-w-none bg-transparent p-0 [--cell-size:2.75rem] [--rdp-weekday-text-transform:none] sm:[--cell-size:3rem]"
          classNames={calendarClassNames}
          components={{
            DayButton: dayProps => <PostCalendarDayButton {...dayProps} postsByDate={postsByDate} />,
          }}
        />
      </div>
    </div>
  )
}

function CalendarDayDetailPanel({
  selectedDay,
  selectedPosts,
  accountsById,
  hasMonthPosts,
  className,
}: {
  selectedDay: Date
  selectedPosts: Post[]
  accountsById: Record<string, AccountSummary>
  hasMonthPosts: boolean
  className?: string
}) {
  const today = useMemo(() => new Date(), [])
  const isToday = isSameCalendarDay(selectedDay, today)
  const selectedLabel = selectedDay.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div className={cn('flex min-h-0 flex-col lg:pl-6', className)}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 px-1">
        <h2 className={cn(dashboardSurface.sectionTitle, 'text-[15px]')}>{selectedLabel}</h2>
        {isToday ? <span className="text-[12px] font-medium text-muted-foreground">Today</span> : null}
        <span className="text-[12px] tabular-nums tracking-tight text-muted-foreground">
          {selectedPosts.length === 0 ? 'Empty' : pluralizePosts(selectedPosts.length)}
        </span>
      </div>

      <ScrollArea className="min-h-0 flex-1" scrollFade scrollbarGutter>
        <div className="px-1 pt-4 pb-2">
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
              className="py-10"
              iconClassName={dashboardSurface.emptyIcon}
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

export function PostsCalendarView({ posts, accountsById, monthKey, onMonthChange, className }: PostsCalendarViewProps) {
  const monthDate = useMemo(() => monthKeyToDate(monthKey), [monthKey])
  const postsByDate = useMemo(() => groupPostsByDateKey(posts), [posts])
  const monthStats = useMemo(() => getMonthPostStatusCounts(posts, monthDate), [posts, monthDate])
  const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const [selectedDay, setPreferredDay] = useSelectedCalendarDay(monthDate, postsByDate)
  const selectedPosts = useMemo(() => getPostsForCalendarDay(posts, selectedDay), [posts, selectedDay])

  return (
    <div
      className={cn(
        'grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:grid-rows-none',
        className,
      )}
    >
      <CalendarMonthPanel
        monthDate={monthDate}
        monthLabel={monthLabel}
        monthStats={monthStats}
        selectedDay={selectedDay}
        postsByDate={postsByDate}
        onSelectDay={day => setPreferredDay(day)}
        onMonthChange={onMonthChange}
      />
      <CalendarDayDetailPanel
        selectedDay={selectedDay}
        selectedPosts={selectedPosts}
        accountsById={accountsById}
        hasMonthPosts={monthStats.total > 0}
        className="mt-5 min-h-[240px] border-t border-border/55 pt-5 lg:mt-0 lg:min-h-0 lg:border-t-0 lg:border-l lg:pt-0"
      />
    </div>
  )
}
