'use client'

import { DashboardSegment, DashboardSegmentButton } from '@/components/dashboard'
import { Button } from '@/components/ui/button'
import { UGC_DEFAULT_DURATION, UGC_DURATION_MAX, UGC_DURATION_MIN, clampUgcDuration } from '@socialista/types'
import { MinusIcon, PlusIcon } from 'lucide-react'

const PRESETS = [5, 8, 10, 15] as const

type UgcDurationControlProps = {
  value: number
  disabled?: boolean
  onChange: (seconds: number) => void
}

export function UgcDurationControl({ value, disabled, onChange }: UgcDurationControlProps) {
  const seconds = clampUgcDuration(value || UGC_DEFAULT_DURATION)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DashboardSegment label="Scene length">
        {PRESETS.map(preset => (
          <DashboardSegmentButton
            key={preset}
            active={seconds === preset}
            disabled={disabled}
            onClick={() => onChange(preset)}
          >
            {preset}s
          </DashboardSegmentButton>
        ))}
      </DashboardSegment>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="icon-xs"
          variant="outline"
          disabled={disabled || seconds <= UGC_DURATION_MIN}
          aria-label="Shorter"
          onClick={() => onChange(seconds - 1)}
        >
          <MinusIcon className="size-3" />
        </Button>
        <span className="min-w-8 text-center text-[12px] font-medium tabular-nums">{seconds}s</span>
        <Button
          type="button"
          size="icon-xs"
          variant="outline"
          disabled={disabled || seconds >= UGC_DURATION_MAX}
          aria-label="Longer"
          onClick={() => onChange(seconds + 1)}
        >
          <PlusIcon className="size-3" />
        </Button>
      </div>
    </div>
  )
}
