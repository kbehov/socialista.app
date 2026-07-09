'use client'

import { MEDIA_FILTER_DEFS, type MediaFilter, type MediaFilterType } from '@/utils/media-filters'
import { InspectorSlider } from './inspector-slider'

type FilterControlsProps = {
  filters: MediaFilter[]
  onChange: (filter: MediaFilter) => void
  onCommit?: (filter: MediaFilter) => void
  onRemove: (type: MediaFilterType) => void
  onRemoveCommit?: (type: MediaFilterType) => void
}

export function FilterControls({ filters, onChange, onCommit, onRemove, onRemoveCommit }: FilterControlsProps) {
  return (
    <div className="my-2 flex flex-col gap-3">
      <div className="text-xs font-medium text-muted-foreground">Filters</div>
      {MEDIA_FILTER_DEFS.map(def => {
        const active = filters.find(filter => filter.type === def.type)
        const sliderValue = active ? active.value : 0

        return (
          <InspectorSlider
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
            format={value => (def.type === 'blur' ? `${value.toFixed(1)}px` : value.toFixed(2))}
          />
        )
      })}
    </div>
  )
}
