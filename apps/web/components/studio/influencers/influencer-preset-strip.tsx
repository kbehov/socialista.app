'use client'

import { InfluencerAvatarSilhouette } from '@/components/studio/influencers/influencer-avatar-silhouette'
import { INFLUENCER_PRESETS, type InfluencerPreset } from '@/lib/studio/influencers/presets'
import { cn } from '@/lib/utils'
import { DicesIcon } from 'lucide-react'

const ITEM_CLASS = cn(
  'flex w-[4.75rem] shrink-0 snap-start flex-col items-center gap-1.5 rounded-md px-1 py-1.5',
  'text-center transition-colors duration-150',
  'hover:bg-muted/30',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
  'disabled:pointer-events-none disabled:opacity-50',
  'active:scale-[0.97] motion-reduce:active:scale-100',
)

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
      <h2 className="mb-2.5 text-[12px] font-medium text-muted-foreground">Looks</h2>
      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-background to-transparent"
        />
        <div
          role="listbox"
          aria-label="Preset looks"
          className="flex snap-x snap-proximity gap-0.5 overflow-x-auto overscroll-x-contain pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {INFLUENCER_PRESETS.map(preset => {
            const selected = selectedId === preset.id
            const { appearance } = preset.form

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
                    'flex size-10 items-center justify-center overflow-hidden rounded-full transition-[box-shadow] duration-150',
                    selected
                      ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                      : 'ring-1 ring-border/50 hover:ring-border',
                  )}
                >
                  <InfluencerAvatarSilhouette
                    skinTone={appearance.skinTone}
                    hairColor={appearance.hairColor}
                    eyeColor={appearance.eyeColor}
                    hairStyle={appearance.hairStyle}
                    facialHair={appearance.facialHair}
                    size="sm"
                  />
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
                'flex size-10 items-center justify-center rounded-full border border-dashed transition-colors duration-150',
                selectedId === 'surprise'
                  ? 'border-foreground/40 bg-muted/40'
                  : 'border-border/70 bg-transparent hover:border-border hover:bg-muted/20',
              )}
            >
              <DicesIcon className="size-3.5 text-foreground/65" strokeWidth={1.75} />
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
