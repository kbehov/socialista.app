import { cn } from '@/lib/utils'

type RunStatusBadgeProps = {
  isComplete: boolean
  isFailed: boolean
  isRunning: boolean
  progress: number
}

export function RunStatusBadge({ isComplete, isFailed, isRunning, progress }: RunStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tabular-nums',
        isComplete && 'bg-foreground text-background',
        isFailed && 'bg-destructive/10 text-destructive',
        isRunning && 'bg-muted text-foreground',
        !isComplete && !isFailed && !isRunning && 'bg-muted text-muted-foreground',
      )}
    >
      {isComplete ? 'Complete' : isFailed ? 'Failed' : isRunning ? `${Math.round(progress)}%` : 'Connecting'}
    </span>
  )
}
