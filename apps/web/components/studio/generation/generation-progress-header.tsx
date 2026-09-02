import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeftIcon } from 'lucide-react'
import Link from 'next/link'
import { RunStatusBadge } from './run-status-badge'

type GenerationProgressHeaderProps = {
  backHref: string
  backLabel?: string
  isComplete: boolean
  isFailed: boolean
  isRunning: boolean
  progress: number
  progressWidth: number
}

export function GenerationProgressHeader({
  backHref,
  backLabel = 'Back',
  isComplete,
  isFailed,
  isRunning,
  progress,
  progressWidth,
}: GenerationProgressHeaderProps) {
  return (
    <header className="sticky top-0 z-10 border-b border-black/8 bg-background/80 backdrop-blur-xl backdrop-saturate-150 dark:border-white/10">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Button asChild className="h-8 gap-1.5 px-2 text-black/56 dark:text-white/56" size="sm" variant="ghost">
          <Link href={backHref}>
            <ArrowLeftIcon className="size-3.5" />
            <span className="text-[13px] font-medium tracking-[-0.01em]">{backLabel}</span>
          </Link>
        </Button>

        <RunStatusBadge
          isComplete={isComplete}
          isFailed={isFailed}
          isRunning={isRunning}
          progress={progress}
        />
      </div>

      <div className="h-px w-full bg-black/10 dark:bg-white/12">
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
