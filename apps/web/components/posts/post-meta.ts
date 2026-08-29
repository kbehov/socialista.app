import type { PostStatus } from '@socialista/types'

export const POST_STATUS_META: Record<
  PostStatus,
  { label: string; className: string; dotClassName: string }
> = {
  draft: {
    label: 'Draft',
    className: 'text-foreground/56',
    dotClassName: 'bg-foreground/30',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'text-sky-700 dark:text-sky-400',
    dotClassName: 'bg-sky-500',
  },
  publishing: {
    label: 'Publishing',
    className: 'text-amber-700 dark:text-amber-400',
    dotClassName: 'bg-amber-500 motion-safe:animate-pulse',
  },
  published: {
    label: 'Published',
    className: 'text-emerald-700 dark:text-emerald-400',
    dotClassName: 'bg-emerald-500',
  },
  failed: {
    label: 'Failed',
    className: 'text-destructive',
    dotClassName: 'bg-destructive',
  },
  canceled: {
    label: 'Canceled',
    className: 'text-foreground/56',
    dotClassName: 'bg-foreground/30',
  },
}

export type PostStatusSummaryItem = {
  status: PostStatus
  label: string
  className: string
}

/** Ordered status chips for count summaries (calendar month strip, etc.). */
export const POST_STATUS_SUMMARY: PostStatusSummaryItem[] = [
  { status: 'scheduled', label: 'Scheduled', className: 'text-sky-700 dark:text-sky-400' },
  { status: 'publishing', label: 'Publishing', className: 'text-amber-700 dark:text-amber-400' },
  { status: 'published', label: 'Published', className: 'text-emerald-700 dark:text-emerald-400' },
  { status: 'draft', label: 'Drafts', className: 'text-foreground/56' },
  { status: 'failed', label: 'Failed', className: 'text-destructive' },
  { status: 'canceled', label: 'Canceled', className: 'text-foreground/56' },
]

/** Compact month strip on the calendar (high-signal statuses only). */
export const CALENDAR_MONTH_STATUS_SUMMARY: PostStatusSummaryItem[] = [
  { status: 'scheduled', label: 'Scheduled', className: 'text-sky-700 dark:text-sky-400' },
  { status: 'published', label: 'Published', className: 'text-emerald-700 dark:text-emerald-400' },
  { status: 'draft', label: 'Drafts', className: 'text-foreground/56' },
]

export function getActiveStatusSummary(
  counts: Partial<Record<PostStatus, number>>,
  summary: PostStatusSummaryItem[] = POST_STATUS_SUMMARY,
) {
  return summary.flatMap(item => {
    const value = counts[item.status] ?? 0
    if (value <= 0) return []
    return [{ ...item, value }]
  })
}

export function formatPostDateTime(value: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}
