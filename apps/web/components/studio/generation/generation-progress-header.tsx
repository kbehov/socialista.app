import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { RunStatusBadge } from './run-status-badge'

type GenerationProgressHeaderProps = {
  backHref: string
  isComplete: boolean
  isFailed: boolean
  isRunning: boolean
  progress: number
  progressWidth: number
}

export function GenerationProgressHeader({
  backHref,
  isComplete,
  isFailed,
  isRunning,
  progress,
  progressWidth,
}: GenerationProgressHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-border/50 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Button asChild className="h-8 gap-1.5 px-2 text-muted-foreground" size="sm" variant="ghost">
          <Link href={backHref}>
            <ArrowLeftIcon className="size-3.5" />
            <span className="text-[13px]">Back</span>
          </Link>
        </Button>

        <RunStatusBadge
          isComplete={isComplete}
          isFailed={isFailed}
          isRunning={isRunning}
          progress={progress}
        />
      </div>

      <div className="h-0.5 w-full bg-muted/60">
        <div
          className={cn(
            'h-full transition-[width] duration-500 ease-[var(--ease-out)] motion-reduce:transition-none',
            isFailed ? 'bg-destructive' : 'bg-foreground',
          )}
          style={{ width: `${progressWidth}%` }}
        />
      </div>
    </header>
  )
}
