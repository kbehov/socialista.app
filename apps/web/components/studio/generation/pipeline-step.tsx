import { Shimmer } from '@/components/ai-elements/shimmer'
import { cn } from '@/lib/utils'
import { CheckIcon } from 'lucide-react'
import type { RefObject } from 'react'

type PipelineStepProps = {
  label: string
  state: 'complete' | 'active' | 'pending'
  detail?: string
  isLast: boolean
  stepRef?: RefObject<HTMLDivElement | null>
}

export function PipelineStep({ label, state, detail, isLast, stepRef }: PipelineStepProps) {
  return (
    <div ref={stepRef} className="relative flex gap-3">
      <div className="flex w-4 shrink-0 flex-col items-center">
        <div
          className={cn(
            'flex size-4 items-center justify-center rounded-full border transition-colors duration-150',
            state === 'complete' && 'border-foreground bg-foreground text-background',
            state === 'active' && 'border-foreground bg-background',
            state === 'pending' && 'border-border/70 bg-muted/30',
          )}
        >
          {state === 'complete' ? (
            <CheckIcon className="size-2" strokeWidth={3} />
          ) : state === 'active' ? (
            <span className="size-1.5 animate-pulse rounded-full bg-foreground motion-reduce:animate-none" />
          ) : (
            <span className="size-1 rounded-full bg-border" />
          )}
        </div>
        {!isLast ? (
          <div
            className={cn('mt-0.5 min-h-5 w-px flex-1', state === 'complete' ? 'bg-foreground/40' : 'bg-border/70')}
          />
        ) : null}
      </div>

      <div className={cn('min-w-0 flex-1', !isLast && 'pb-3.5')}>
        <p
          className={cn(
            'text-[13px] leading-snug',
            state === 'active' && 'font-medium text-foreground',
            state === 'complete' && 'text-muted-foreground',
            state === 'pending' && 'text-muted-foreground/45',
          )}
        >
          {state === 'active' && detail ? (
            <Shimmer as="span" className="text-foreground">
              {detail}
            </Shimmer>
          ) : (
            label
          )}
        </p>
      </div>
    </div>
  )
}
