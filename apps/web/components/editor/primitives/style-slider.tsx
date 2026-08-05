'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

type StyleSliderProps = {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  onChange: (value: number) => void
  onCommit?: (value: number) => void
  className?: string
}

export function StyleSlider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  onChange,
  onCommit,
  className,
}: StyleSliderProps) {
  const commit = (next: number) => {
    const clamped = Math.min(max, Math.max(min, next))
    onChange(clamped)
    onCommit?.(clamped)
  }

  const display = Number.isFinite(value) ? value : min

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <div className="flex min-w-0 items-center gap-2">
        <Label className="min-w-0 flex-1 truncate text-[11px] font-normal tracking-[0.01em] text-muted-foreground/70">
          {label}
        </Label>
        <div className="relative shrink-0">
          <Input
            type="number"
            min={min}
            max={max}
            step={step}
            value={display}
            onChange={event => {
              const next = Number(event.target.value)
              if (!Number.isFinite(next)) return
              commit(next)
            }}
            className={cn(
              'h-6 w-[3.25rem] px-1.5 text-center text-[11px] tabular-nums',
              suffix && 'pr-5',
            )}
            aria-label={`${label} value`}
          />
          {suffix ? (
            <span
              className="pointer-events-none absolute inset-y-0 right-1.5 flex items-center text-[9px] leading-none text-muted-foreground/80"
              aria-hidden
            >
              {suffix}
            </span>
          ) : null}
        </div>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={values => {
          const next = values[0]
          if (typeof next !== 'number') return
          onChange(next)
        }}
        onValueCommit={values => {
          const next = values[0]
          if (typeof next !== 'number') return
          onCommit?.(next)
        }}
        aria-label={label}
      />
    </div>
  )
}
