'use client'

import { dashboardSurface } from '@/components/dashboard'
import { cn } from '@/lib/utils'
import {
  UGC_CLIP_TYPE_DESCRIPTIONS,
  UGC_CLIP_TYPE_LABELS,
  UGC_CLIP_TYPES,
  type UgcClipType,
} from '@socialista/types'

type UgcClipTypePickerProps = {
  disabled?: boolean
  onSelect: (type: UgcClipType) => void
}

export function UgcClipTypePicker({ disabled, onSelect }: UgcClipTypePickerProps) {
  return (
    <section className={dashboardSurface.section}>
      <div className={cn(dashboardSurface.sectionHeader, 'px-4 py-3')}>
        <h2 className={dashboardSurface.sectionTitle}>What do you want to make?</h2>
        <p className={dashboardSurface.sectionDescription}>Each clip is its own 5–15s video. Add as many as you need.</p>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4 sm:grid-cols-3">
        {UGC_CLIP_TYPES.map(type => (
          <button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(type)}
            className="rounded-xl border border-border/60 bg-background px-3 py-3 text-left transition hover:border-border hover:shadow-sm disabled:opacity-50"
          >
            <p className="text-sm font-medium tracking-tight">{UGC_CLIP_TYPE_LABELS[type]}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {UGC_CLIP_TYPE_DESCRIPTIONS[type]}
            </p>
          </button>
        ))}
      </div>
    </section>
  )
}
