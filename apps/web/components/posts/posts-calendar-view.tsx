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
  onEditPost?: (post: Post) => void
  onPostNow?: (post: Post) => void
  onDeletePost?: (post: Post) => void
  publishingPostId?: string | null
  className?: string
}

const calendarClassNames = {
  root: '!w-full max-w-none',
  months: 'w-full max-w-none',
  month: 'relative w-full max-w-none gap-2',
  nav: 'hidden',
  month_caption: 'hidden',
  month_grid: 'w-full max-w-none',
  weekdays: 'flex w-full',
  weekday:
    'flex h-8 flex-1 basis-0 items-center justify-center text-[11px] font-medium text-foreground/56 normal-case select-none',
  week: 'flex w-full',
  day: 'relative flex h-(--cell-size) min-h-(--cell-size) flex-1 basis-0 min-w-0',
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
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-[13px] font-medium tracking-tight text-foreground">{monthLabel}</h2>
          <p className="mt-0.5 text-[12px] leading-snug text-foreground/56">
            {monthStats.total > 0 ? (
              <PostStatusCountsText counts={monthStats.counts} summary={CALENDAR_MONTH_STATUS_SUMMARY} />
            ) : (
              'No posts this month'
            )}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-7 rounded-md text-foreground/56 hover:text-foreground"
            aria-label="Previous month"
            onClick={() =>
              onMonthChange(dateToMonthKey(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1)))
            }
          >
            <ChevronLeftIcon className="size-4" strokeWidth={1.5} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="size-7 rounded-md text-foreground/56 hover:text-foreground"
            aria-label="Next month"
            onClick={() =>
              onMonthChange(dateToMonthKey(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1)))
            }
          >
            <ChevronRightIcon className="size-4" strokeWidth={1.5} />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-3">
        <Calendar
          mode="single"
          selected={selectedDay}
          onSelect={day => {
            if (day) onSelectDay(day)
          }}
          month={monthDate}
          onMonthChange={date => onMonthChange(dateToMonthKey(date))}
          formatters={{ formatWeekdayName }}
          className="w-full max-w-none bg-transparent p-0 [--cell-size:2.5rem] [--rdp-weekday-text-transform:none] sm:[--cell-size:2.75rem]"
          fixedWeeks
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
  onEditPost,
  onPostNow,
  onDeletePost,
  publishingPostId,
  className,
}: {
  selectedDay: Date
  selectedPosts: Post[]
  accountsById: Record<string, AccountSummary>
  hasMonthPosts: boolean
  onEditPost?: (post: Post) => void
  onPostNow?: (post: Post) => void
  onDeletePost?: (post: Post) => void
  publishingPostId?: string | null
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
    <div className={cn('flex min-h-0 flex-col overflow-hidden', className)}>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <h2 className="text-[13px] font-medium tracking-tight text-foreground">{selectedLabel}</h2>
        {isToday ? <span className="text-[12px] font-medium text-foreground/56">Today</span> : null}
        <span className="text-[12px] tabular-nums tracking-tight text-foreground/56">
          {selectedPosts.length === 0 ? 'Empty' : pluralizePosts(selectedPosts.length)}
        </span>
      </div>

      <ScrollArea className="min-h-0 flex-1" scrollFade scrollbarGutter>
        <div className="pt-2 pb-2">
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
            <ul className="divide-y divide-foreground/10" aria-label={`Posts for ${selectedLabel}`}>
              {selectedPosts.map(post => (
                <li key={post._id}>
                  <PostCalendarTimelineItem
                    post={post}
                    account={resolvePostAccount(post, accountsById)}
                    onEdit={onEditPost}
                    onPostNow={onPostNow}
                    onDelete={onDeletePost}
                    isPublishing={publishingPostId === post._id}
                  />
                </li>
              ))}
            </ul>
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
  onEditPost,
  onPostNow,
  onDeletePost,
  publishingPostId = null,
  className,
}: PostsCalendarViewProps) {
  const monthDate = useMemo(() => monthKeyToDate(monthKey), [monthKey])
  const postsByDate = useMemo(() => groupPostsByDateKey(posts), [posts])
  const monthStats = useMemo(() => getMonthPostStatusCounts(posts, monthDate), [posts, monthDate])
  const monthLabel = monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const [selectedDay, setPreferredDay] = useSelectedCalendarDay(monthDate, postsByDate)
  const selectedPosts = useMemo(() => getPostsForCalendarDay(posts, selectedDay), [posts, selectedDay])

  return (
    <div
      className={cn(
        'grid min-h-0 flex-1 overflow-hidden grid-rows-[minmax(0,1.35fr)_minmax(12rem,1fr)] lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:grid-rows-none',
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
        onEditPost={onEditPost}
        onPostNow={onPostNow}
        onDeletePost={onDeletePost}
        publishingPostId={publishingPostId}
        className="mt-4 min-h-0 border-t border-foreground/10 pt-4 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6"
      />
    </div>
  )
}
