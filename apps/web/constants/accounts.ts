import { ConnectionStatus } from '@socialista/types'

export const STATUS_META: Record<
  ConnectionStatus,
  { label: string; className: string; dotClassName: string }
> = {
  connected: {
    label: 'Connected',
    className: 'text-emerald-700 dark:text-emerald-400',
    dotClassName: 'bg-emerald-500',
  },
  pending: {
    label: 'Pending',
    className: 'text-amber-700 dark:text-amber-400',
    dotClassName: 'bg-amber-500 motion-safe:animate-pulse',
  },
  disconnected: {
    label: 'Disconnected',
    className: 'text-foreground/56',
    dotClassName: 'bg-foreground/30',
  },
  error: {
    label: 'Error',
    className: 'text-destructive',
    dotClassName: 'bg-destructive',
  },
}
