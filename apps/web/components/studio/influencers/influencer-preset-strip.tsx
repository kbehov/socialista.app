'use client'

import { INFLUENCER_PRESETS, type InfluencerPreset } from '@/lib/studio/influencers/presets'
import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

const ITEM_CLASS = cn(
  'flex w-[4.75rem] shrink-0 snap-start flex-col items-center gap-1.5 rounded-lg px-1 py-1.5',
  'text-center transition-colors duration-150',
  'hover:bg-muted/35',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
  'disabled:pointer-events-none disabled:opacity-50',
  'active:scale-[0.97] motion-reduce:active:scale-100',
)

function presetChipStyle(preset: InfluencerPreset): CSSProperties {
  return {
    background: `linear-gradient(145deg, color-mix(in oklab, ${preset.avatar.skin} 28%, transparent), color-mix(in oklab, ${preset.avatar.hair} 18%, transparent))`,
  }
}

type InfluencerPresetStripProps = {
  selectedId: string | null
  onSelect: (preset: InfluencerPreset) => void
  onSurprise: () => void
  disabled?: boolean
}

export function InfluencerPresetStrip({
  selectedId,
  onSelect,
  onSurprise,
  disabled,
}: InfluencerPresetStripProps) {
  return (
    <section className="min-w-0">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-[13px] font-semibold tracking-[-0.02em] text-foreground">Quick start</h2>
        <p className="text-[11px] text-muted-foreground">Pick a vibe, then tweak below</p>
      </div>
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-background to-transparent"
        />
        <div
          role="listbox"
          aria-label="Preset looks"
          className="flex snap-x snap-proximity gap-1 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {INFLUENCER_PRESETS.map(preset => {
            const selected = selectedId === preset.id

            return (
              <button
                key={preset.id}
                type="button"
                role="option"
                aria-selected={selected}
                disabled={disabled}
                onClick={() => onSelect(preset)}
                className={ITEM_CLASS}
              >
                <span
                  className={cn(
                    'flex size-11 items-center justify-center rounded-2xl text-[1.35rem] leading-none shadow-[inset_0_1px_0_oklch(1_0_0/0.12)] transition-[box-shadow,transform] duration-150',
                    selected
                      ? 'ring-2 ring-foreground/90 ring-offset-2 ring-offset-background'
                      : 'ring-1 ring-border/45 hover:ring-border/70',
                  )}
                  style={presetChipStyle(preset)}
                >
                  <span aria-hidden className="select-none">
                    {preset.emoji}
                  </span>
                </span>
                <span className="line-clamp-2 w-full text-[11px] leading-snug font-medium tracking-[-0.01em] text-foreground">
                  {preset.title}
                </span>
              </button>
            )
          })}

          <button
            type="button"
            role="option"
            aria-selected={selectedId === 'surprise'}
            disabled={disabled}
            onClick={onSurprise}
            className={ITEM_CLASS}
          >
            <span
              className={cn(
                'flex size-11 items-center justify-center rounded-2xl text-[1.35rem] leading-none transition-[box-shadow,background-color] duration-150',
                selectedId === 'surprise'
                  ? 'bg-muted/55 ring-2 ring-foreground/90 ring-offset-2 ring-offset-background'
                  : 'bg-muted/25 ring-1 ring-dashed ring-border/60 hover:bg-muted/40 hover:ring-border',
              )}
            >
              <span aria-hidden className="select-none">🎲</span>
            </span>
            <span className="line-clamp-2 w-full text-[11px] leading-snug font-medium tracking-[-0.01em] text-foreground">
              Surprise
            </span>
          </button>
        </div>
      </div>
    </section>
  )
}
