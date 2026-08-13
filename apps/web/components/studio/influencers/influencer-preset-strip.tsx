'use client'

import { InfluencerAvatarSilhouette } from '@/components/studio/influencers/influencer-avatar-silhouette'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/components/ui/carousel'
import { INFLUENCER_PRESETS, type InfluencerPreset } from '@/lib/studio/influencers/presets'
import { cn } from '@/lib/utils'
import { ChevronLeftIcon, ChevronRightIcon, DicesIcon } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'

const TAP_SPRING = { type: 'spring' as const, bounce: 0, duration: 0.28 }

const CARD_CLASS = cn(
  'flex h-full w-[8.75rem] flex-col items-start rounded-2xl p-3 text-left',
  'ring-1 transition-[background-color,box-shadow,ring-color] duration-150',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
  'disabled:pointer-events-none disabled:opacity-50',
)

type InfluencerPresetStripProps = {
  selectedId: string | null
  onSelect: (preset: InfluencerPreset) => void
  onSurprise: () => void
  disabled?: boolean
}

function PresetCarouselNav() {
  const { canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useCarousel()

  if (!canScrollPrev && !canScrollNext) return null

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        aria-label="Scroll personas left"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded-full',
          'text-muted-foreground ring-1 ring-border/40',
          'transition-[color,background-color,opacity] duration-150',
          'hover:bg-muted/50 hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
          'disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <ChevronLeftIcon className="size-3.5" strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="Scroll personas right"
        disabled={!canScrollNext}
        onClick={scrollNext}
        className={cn(
          'inline-flex size-7 items-center justify-center rounded-full',
          'text-muted-foreground ring-1 ring-border/40',
          'transition-[color,background-color,opacity] duration-150',
          'hover:bg-muted/50 hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45',
          'disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <ChevronRightIcon className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}

export function InfluencerPresetStrip({
  selectedId,
  onSelect,
  onSurprise,
  disabled,
}: InfluencerPresetStripProps) {
  const reduceMotion = useReducedMotion()

  return (
    <Carousel
      className="w-full min-w-0"
      opts={{
        align: 'start',
        dragFree: true,
        containScroll: 'trimSnaps',
      }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[13px] font-medium tracking-[-0.015em] text-foreground">Personas</p>
        <PresetCarouselNav />
      </div>

      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-linear-to-r from-background to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-linear-to-l from-background to-transparent"
        />

        <CarouselContent className="ml-0" role="listbox" aria-label="Preset personas">
          {INFLUENCER_PRESETS.map((preset, index) => {
            const selected = selectedId === preset.id
            const { appearance } = preset.form

            return (
              <CarouselItem
                key={preset.id}
                className={cn('basis-auto self-stretch pl-0', index > 0 && 'pl-2', index === 0 && 'pl-0.5')}
              >
                <motion.button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={disabled}
                  onClick={() => onSelect(preset)}
                  whileTap={reduceMotion || disabled ? undefined : { scale: 0.98 }}
                  transition={reduceMotion ? { duration: 0 } : TAP_SPRING}
                  className={cn(
                    CARD_CLASS,
                    selected
                      ? 'bg-foreground/[0.045] shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-foreground/20'
                      : 'bg-muted/10 ring-border/30 hover:bg-muted/20 hover:ring-border/45',
                  )}
                >
                  <span className="mb-2.5 flex size-10 items-center justify-center overflow-hidden">
                    <InfluencerAvatarSilhouette
                      skinTone={appearance.skinTone}
                      hairColor={appearance.hairColor}
                      eyeColor={appearance.eyeColor}
                      hairStyle={appearance.hairStyle}
                      facialHair={appearance.facialHair}
                      size="sm"
                    />
                  </span>
                  <span className="text-[13px] font-medium leading-snug tracking-[-0.015em] text-foreground">
                    {preset.title}
                  </span>
                  <span className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
                    {preset.useCase}
                  </span>
                </motion.button>
              </CarouselItem>
            )
          })}

          <CarouselItem className="mr-0.5 basis-auto self-stretch pl-2">
            <motion.button
              type="button"
              role="option"
              aria-selected={selectedId === 'surprise'}
              disabled={disabled}
              onClick={onSurprise}
              whileTap={reduceMotion || disabled ? undefined : { scale: 0.98 }}
              transition={reduceMotion ? { duration: 0 } : TAP_SPRING}
              className={cn(
                CARD_CLASS,
                selectedId === 'surprise'
                  ? 'bg-foreground/[0.045] shadow-[0_1px_3px_rgba(0,0,0,0.04)] ring-foreground/20'
                  : 'bg-transparent ring-border/40 ring-dashed hover:bg-muted/15 hover:ring-border/55',
              )}
            >
              <span className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-muted/40 ring-1 ring-border/35">
                <DicesIcon className="size-4 text-foreground/70" strokeWidth={1.75} />
              </span>
              <span className="text-[13px] font-medium leading-snug tracking-[-0.015em] text-foreground">
                Surprise me
              </span>
              <span className="mt-0.5 line-clamp-2 text-[12px] leading-snug text-muted-foreground">
                A coherent random look
              </span>
            </motion.button>
          </CarouselItem>
        </CarouselContent>
      </div>
    </Carousel>
  )
}
