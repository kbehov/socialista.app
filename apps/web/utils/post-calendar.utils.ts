import { getPostDisplayDate, isSameCalendarDay, toDateKey } from '@/lib/posts/post-display'
import type { Post, PostStatus } from '@socialista/types'

export function getDayPostDotClass(posts: Post[]): string {
  const statuses = new Set(posts.map(post => post.status))

  if (statuses.has('failed')) return 'bg-destructive'
  if (statuses.has('scheduled') || statuses.has('publishing')) return 'bg-sky-500'
  if (statuses.has('published')) return 'bg-emerald-500'
  return 'bg-foreground/40'
}

export function isSameCalendarMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
}

/** Prefer current selection, else today, else first day with posts, else the 1st. */
export function resolveSelectedCalendarDay(monthDate: Date, postsByDate: Map<string, Post[]>, preferred?: Date): Date {
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

export function formatDayDotCount(count: number): number {
  return Math.min(count, 3)
}
