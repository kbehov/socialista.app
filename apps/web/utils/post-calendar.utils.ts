import {
  getPostDisplayDate,
  isSameCalendarDay,
  toDateKey,
} from '@/lib/post-display'
import type { Post, PostStatus } from '@socialista/types'

export type DayPostTone = {
  cellClass: string
  ringClass: string
  badgeClass: string
}

const FAILED_TONE: DayPostTone = {
  cellClass: 'bg-destructive/14 text-destructive',
  ringClass: 'ring-destructive/25',
  badgeClass: 'bg-destructive text-destructive-foreground',
}

const SCHEDULED_TONE: DayPostTone = {
  cellClass: 'bg-sky-500/16 text-sky-950 dark:text-sky-50',
  ringClass: 'ring-sky-500/30',
  badgeClass: 'bg-sky-600 text-white dark:bg-sky-500',
}

const DRAFT_TONE: DayPostTone = {
  cellClass: 'bg-amber-500/14 text-amber-950 dark:text-amber-50',
  ringClass: 'ring-amber-500/28',
  badgeClass: 'bg-amber-600 text-white dark:bg-amber-500',
}

const PUBLISHED_TONE: DayPostTone = {
  cellClass: 'bg-emerald-500/14 text-emerald-950 dark:text-emerald-50',
  ringClass: 'ring-emerald-500/28',
  badgeClass: 'bg-emerald-600 text-white dark:bg-emerald-500',
}

const DEFAULT_TONE: DayPostTone = {
  cellClass: 'bg-primary/12 text-foreground',
  ringClass: 'ring-primary/25',
  badgeClass: 'bg-primary text-primary-foreground',
}

/** Priority-based day coloring for the posts calendar. */
export function getDayPostTone(posts: Post[]): DayPostTone {
  const statuses = new Set(posts.map(post => post.status))

  if (statuses.has('failed')) return FAILED_TONE
  if (statuses.has('scheduled') || statuses.has('publishing')) return SCHEDULED_TONE
  if (statuses.has('draft')) return DRAFT_TONE
  if (statuses.has('published')) return PUBLISHED_TONE
  return DEFAULT_TONE
}

export function isSameCalendarMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

/** Prefer current selection, else today, else first day with posts, else the 1st. */
export function resolveSelectedCalendarDay(
  monthDate: Date,
  postsByDate: Map<string, Post[]>,
  preferred?: Date,
): Date {
  if (preferred && isSameCalendarMonth(preferred, monthDate)) {
    return preferred
  }

  const today = new Date()
  if (isSameCalendarMonth(today, monthDate)) {
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

export function getMonthPostStatusCounts(
  posts: Post[],
  monthDate: Date,
): { counts: Partial<Record<PostStatus, number>>; total: number } {
  const counts: Partial<Record<PostStatus, number>> = {}

  for (const post of posts) {
    const date = getPostDisplayDate(post)
    if (!isSameCalendarMonth(date, monthDate)) continue
    counts[post.status] = (counts[post.status] ?? 0) + 1
  }

  const total = Object.values(counts).reduce((sum, value) => sum + (value ?? 0), 0)
  return { counts, total }
}

export function getPostsForCalendarDay(posts: Post[], day: Date): Post[] {
  return posts
    .filter(post => isSameCalendarDay(getPostDisplayDate(post), day))
    .toSorted((a, b) => getPostDisplayDate(a).getTime() - getPostDisplayDate(b).getTime())
}

export function formatDayBadgeCount(count: number): string {
  return count > 9 ? '9+' : String(count)
}
