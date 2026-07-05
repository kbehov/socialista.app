'use client'

import type { Transition, TransitionType } from '@socialista/types'

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
      <div className="text-xs font-medium text-muted-foreground">Transition</div>
      <select
        value={type}
        onChange={e => onChange({ type: e.target.value as TransitionType, duration })}
        className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
      >
        {TRANSITIONS.map(t => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      {type !== 'cut' && (
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Duration</label>
          <input
            type="number"
            min={0.1}
            max={5}
            step={0.1}
            value={duration}
            onChange={e => onChange({ type, duration: parseFloat(e.target.value) || 0.5 })}
            className="h-8 w-20 rounded-md border border-input bg-transparent px-2 text-xs"
          />
          <span className="text-xs text-muted-foreground">s</span>
        </div>
      )}
    </div>
  )
}
