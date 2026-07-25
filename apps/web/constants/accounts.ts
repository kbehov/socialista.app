import { ConnectionStatus } from '@socialista/types'

export const STATUS_META: Record<
  ConnectionStatus,
  { label: string; className: string; dotClassName: string; pulse?: boolean }
> = {
  connected: {
    label: 'Connected',
    className: 'border-emerald-500/25 bg-emerald-500/[0.08] text-emerald-700 dark:text-emerald-400',
    dotClassName: 'bg-emerald-500',
    pulse: true,
  },
  pending: {
    label: 'Pending',
    className: 'border-amber-500/25 bg-amber-500/[0.08] text-amber-700 dark:text-amber-400',
    dotClassName: 'bg-amber-500',
  },
  disconnected: {
    label: 'Disconnected',
    className: 'border-border/80 bg-muted/50 text-muted-foreground',
    dotClassName: 'bg-muted-foreground/40',
  },
  error: {
    label: 'Error',
    className: 'border-destructive/25 bg-destructive/[0.08] text-destructive',
    dotClassName: 'bg-destructive',
  },
}
