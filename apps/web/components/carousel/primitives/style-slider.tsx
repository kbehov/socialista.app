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

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-2">
        <Label className="text-[11px] font-medium text-muted-foreground">{label}</Label>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={min}
            max={max}
            step={step}
            value={Number.isFinite(value) ? value : min}
            onChange={event => {
              const next = Number(event.target.value)
              if (!Number.isFinite(next)) return
              commit(next)
            }}
            className="h-6 w-14 px-1.5 text-center text-[11px] tabular-nums"
            aria-label={`${label} value`}
          />
          {suffix ? <span className="min-w-3 text-[10px] text-muted-foreground">{suffix}</span> : null}
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
