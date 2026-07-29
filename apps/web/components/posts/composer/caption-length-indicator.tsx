'use client'

import { CharacterCountRing } from '@/components/common/charachter-count-ring'
import { cn } from '@/lib/utils'

type CaptionLengthIndicatorProps = {
  current: number
  max: number
  className?: string
  showRing?: boolean
}

export function CaptionLengthIndicator({
  current,
  max,
  className,
  showRing = true,
}: CaptionLengthIndicatorProps) {
  const overLimit = current > max
  const nearLimit = !overLimit && current > max * 0.9

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {showRing ? <CharacterCountRing current={current} max={max} /> : null}
      <span
        className={cn(
          'text-[11px] tabular-nums tracking-tight',
          overLimit
            ? 'font-medium text-destructive'
            : nearLimit
              ? 'text-amber-600 dark:text-amber-500'
              : 'text-muted-foreground',
        )}
      >
        {current.toLocaleString()}
        <span className="text-muted-foreground/60"> / {max.toLocaleString()}</span>
      </span>
    </div>
  )
}
