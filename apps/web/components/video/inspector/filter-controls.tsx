'use client'

import { Slider } from './slider'
import type { VideoFilter, VideoFilterType } from '@socialista/types'

type FilterControlsProps = {
  filters: VideoFilter[]
  onChange: (filter: VideoFilter) => void
  onCommit?: (filter: VideoFilter) => void
  onRemove: (type: VideoFilterType) => void
  onRemoveCommit?: (type: VideoFilterType) => void
}

const FILTER_DEFS: { type: VideoFilterType; label: string; min: number; max: number; step: number }[] = [
  { type: 'brightness', label: 'Brightness', min: -1, max: 1, step: 0.05 },
  { type: 'contrast', label: 'Contrast', min: -1, max: 1, step: 0.05 },
  { type: 'saturation', label: 'Saturation', min: -1, max: 1, step: 0.05 },
  { type: 'blur', label: 'Blur', min: 0, max: 20, step: 0.5 },
  { type: 'grayscale', label: 'Grayscale', min: 0, max: 1, step: 0.05 },
]

export function FilterControls({ filters, onChange, onCommit, onRemove, onRemoveCommit }: FilterControlsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-medium text-muted-foreground">Filters</div>
      {FILTER_DEFS.map(def => {
        const active = filters.find(f => f.type === def.type)
        const sliderValue = active ? active.value : def.type === 'blur' ? 0 : 0
        return (
          <Slider
            key={def.type}
            label={def.label}
            min={def.min}
            max={def.max}
            step={def.step}
            value={sliderValue}
            onChange={value => {
              if (value === 0 && def.type !== 'grayscale') {
                onRemove(def.type)
              } else {
                onChange({ type: def.type, value })
              }
            }}
            onCommit={value => {
              if (value === 0 && def.type !== 'grayscale') {
                onRemoveCommit?.(def.type)
              } else {
                onCommit?.({ type: def.type, value })
              }
            }}
            format={v => (def.type === 'blur' ? `${v.toFixed(1)}px` : v.toFixed(2))}
          />
        )
      })}
    </div>
  )
}
