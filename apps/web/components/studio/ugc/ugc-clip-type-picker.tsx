'use client'

import { dashboardSurface } from '@/components/dashboard'
import { cn } from '@/lib/utils'
import {
  UGC_CLIP_TYPE_DESCRIPTIONS,
  UGC_CLIP_TYPE_LABELS,
  UGC_CLIP_TYPES,
  type UgcClipType,
} from '@socialista/types'
import {
  BoxIcon,
  HandIcon,
  ShirtIcon,
  SmartphoneIcon,
  SparklesIcon,
  SpeechIcon,
  type LucideIcon,
} from 'lucide-react'

const CLIP_TYPE_ICONS: Record<UgcClipType, LucideIcon> = {
  talking: SpeechIcon,
  'b-roll': SparklesIcon,
  unboxing: BoxIcon,
  'try-on': ShirtIcon,
  'product-hold': HandIcon,
  'app-showcase': SmartphoneIcon,
}

type UgcClipTypePickerProps = {
  disabled?: boolean
  framed?: boolean
  onSelect: (type: UgcClipType) => void
}

export function UgcClipTypePicker({ disabled, framed = true, onSelect }: UgcClipTypePickerProps) {
  const grid = (
    <div className={cn('grid grid-cols-2 gap-2', framed ? 'p-4 sm:grid-cols-3' : 'sm:grid-cols-2')}>
      {UGC_CLIP_TYPES.map(type => {
        const Icon = CLIP_TYPE_ICONS[type]
        return (
          <button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(type)}
            className="rounded-xl border border-border/60 bg-background px-3 py-3 text-left transition hover:border-border hover:shadow-sm active:scale-[0.98] disabled:opacity-50 motion-reduce:active:scale-100"
          >
            <Icon className="size-4 text-muted-foreground" strokeWidth={1.75} />
            <p className="mt-2 text-sm font-medium tracking-tight">{UGC_CLIP_TYPE_LABELS[type]}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              {UGC_CLIP_TYPE_DESCRIPTIONS[type]}
            </p>
          </button>
        )
      })}
    </div>
  )

  if (!framed) return grid

  return (
    <section className={dashboardSurface.section}>
      <div className={cn(dashboardSurface.sectionHeader, 'px-4 py-3')}>
        <h2 className={dashboardSurface.sectionTitle}>What do you want to make?</h2>
        <p className={dashboardSurface.sectionDescription}>Each clip is its own 5–15s video. Add as many as you need.</p>
      </div>
      {grid}
    </section>
  )
}
