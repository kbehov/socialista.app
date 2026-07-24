import type { PostStatus } from '@socialista/types'

export const POST_STATUS_META: Record<
  PostStatus,
  { label: string; className: string; dotClassName: string }
> = {
  draft: {
    label: 'Draft',
    className: 'border-border/70 bg-muted/50 text-muted-foreground',
    dotClassName: 'bg-muted-foreground/70',
  },
  scheduled: {
    label: 'Scheduled',
    className: 'border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-400',
    dotClassName: 'bg-sky-500',
  },
  publishing: {
    label: 'Publishing',
    className: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400',
    dotClassName: 'bg-amber-500',
  },
  published: {
    label: 'Published',
    className: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    dotClassName: 'bg-emerald-500',
  },
  failed: {
    label: 'Failed',
    className: 'border-destructive/20 bg-destructive/10 text-destructive',
    dotClassName: 'bg-destructive',
  },
  canceled: {
    label: 'Canceled',
    className: 'border-border/70 bg-muted/40 text-muted-foreground',
    dotClassName: 'bg-muted-foreground/50',
  },
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

export function formatPostTime(value: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}
