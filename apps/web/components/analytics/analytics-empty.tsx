import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type AnalyticsEmptyMotif = 'line' | 'bars' | 'shares'

export type AnalyticsEmptyProps = {
  title?: ReactNode
  description?: ReactNode
  icon?: ReactNode
  /** Quiet chart sketch for panels that would otherwise be a blank plot. */
  motif?: AnalyticsEmptyMotif
  className?: string
  minHeightClassName?: string
}

/** Soft empty / zero-data state for analytics panels. */
function AnalyticsEmpty({
  title = 'Nothing to show',
  description,
  icon,
  motif,
  className,
  minHeightClassName = 'min-h-28',
}: AnalyticsEmptyProps) {
  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-2.5 px-4 py-4 text-center',
        minHeightClassName,
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            'flex size-8 items-center justify-center rounded-[var(--radius-lg)] bg-background text-foreground/80 shadow-[var(--shadow-border)] dark:bg-card',
          )}
        >
          {icon}
        </span>
      ) : motif ? (
        <AnalyticsMotif motif={motif} />
      ) : null}

      <div className="flex max-w-[16rem] flex-col gap-1">
        <p className="text-balance text-[13px] font-medium tracking-tight text-foreground">{title}</p>
        {description ? (
          <p className="text-pretty text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  )
}

function AnalyticsMotif({ motif }: { motif: AnalyticsEmptyMotif }) {
  if (motif === 'bars') {
    return (
      <div className="flex h-8 items-end gap-1.5" aria-hidden>
        {[
          'h-3.5 bg-muted-foreground/15',
          'h-[22px] bg-muted-foreground/20',
          'h-4 bg-muted-foreground/15',
          'h-7 bg-muted-foreground/30',
          'h-5 bg-muted-foreground/20',
        ].map(bar => (
          <span key={bar} className={cn('w-2 rounded-[3px]', bar)} />
        ))}
      </div>
    )
  }

  if (motif === 'shares') {
    return (
      <div className="flex w-28 flex-col gap-1.5" aria-hidden>
        <span className="h-1.5 w-full rounded-full bg-muted-foreground/25" />
        <span className="h-1.5 w-[68%] rounded-full bg-muted-foreground/18" />
        <span className="h-1.5 w-[40%] rounded-full bg-muted-foreground/12" />
      </div>
    )
  }

  return (
    <svg viewBox="0 0 128 36" className="h-8 w-32 text-muted-foreground/55" fill="none" aria-hidden>
      <path d="M1 29h126" stroke="currentColor" strokeOpacity="0.45" strokeLinecap="round" />
      <path
        d="M2 26c12 0 14-12 26-14s16 8 26 4 14-14 28-12 20 10 44 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="124" cy="6" r="2.25" fill="currentColor" />
    </svg>
  )
}

export { AnalyticsEmpty }
