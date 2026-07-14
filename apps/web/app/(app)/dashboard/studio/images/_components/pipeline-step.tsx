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
            'flex size-4 items-center justify-center rounded-full border',
            state === 'complete' && 'border-foreground bg-emerald-500 text-background',
            state === 'active' && 'border-yellow-400 bg-yellow-200',
            state === 'pending' && 'border-border/80 bg-background ',
          )}
        >
          {state === 'complete' ? (
            <CheckIcon className="size-2" strokeWidth={3} />
          ) : state === 'active' ? (
            <span className="size-1 rounded-full bg-black" />
          ) : (
            <span className="size-1 rounded-full bg-border" />
          )}
        </div>
        {!isLast ? (
          <div
            className={cn('mt-0.5 w-px flex-1 min-h-5', state === 'complete' ? 'bg-foreground/70' : 'bg-border/80')}
          />
        ) : null}
      </div>

      <div className={cn('min-w-0 flex-1', !isLast && 'pb-4')}>
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
