'use client'

import type { Transition, TransitionType } from '@socialista/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

const TRANSITIONS: { value: TransitionType; label: string }[] = [
  { value: 'cut', label: 'Cut' },
  { value: 'fade', label: 'Fade' },
  { value: 'dissolve', label: 'Dissolve' },
  { value: 'wipe-left', label: 'Wipe left' },
  { value: 'wipe-right', label: 'Wipe right' },
]

type TransitionPickerProps = {
  value?: Transition
  onChange: (transition: Transition) => void
}

export function TransitionPicker({ value, onChange }: TransitionPickerProps) {
  const type = value?.type ?? 'cut'
  const duration = value?.duration ?? 0.5
  return (
    <div className="flex flex-col gap-2">
      <Select
        value={type}
        onValueChange={v => onChange({ type: v as TransitionType, duration })}
      >
        <SelectTrigger className="h-8 w-full text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TRANSITIONS.map(t => (
            <SelectItem key={t.value} value={t.value}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {type !== 'cut' && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Duration</label>
          <Input
            type="number"
            min={0.1}
            max={5}
            step={0.1}
            value={duration}
            onChange={e => onChange({ type, duration: parseFloat(e.target.value) || 0.5 })}
            className="h-8 w-20 text-xs tabular-nums"
          />
          <span className="text-xs text-muted-foreground">s</span>
        </div>
      )}
    </div>
  )
}
