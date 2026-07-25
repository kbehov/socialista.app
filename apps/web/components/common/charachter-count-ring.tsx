import { cn } from '@/lib/utils'

export function CharacterCountRing({ current, max, className }: { current: number; max: number; className?: string }) {
  const ratio = Math.min(current / max, 1)
  const overLimit = current > max
  const circumference = 2 * Math.PI * 9
  const offset = circumference * (1 - ratio)

  return (
    <span className={cn('relative inline-flex size-5.5 items-center justify-center', className)} aria-hidden>
      <svg className="size-5.5 -rotate-90" viewBox="0 0 22 22">
        <circle cx="11" cy="11" r="9" fill="none" stroke="currentColor" strokeWidth="2" className="text-border" />
        <circle
          cx="11"
          cy="11"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'transition-[stroke-dashoffset] duration-150',
            overLimit ? 'text-destructive' : ratio > 0.9 ? 'text-amber-500' : 'text-foreground/60',
          )}
        />
      </svg>
      {overLimit ? <span className="absolute size-1.5 rounded-full bg-destructive" /> : null}
    </span>
  )
}
