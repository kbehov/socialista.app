'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import {
  STATIC_AD_FORMAT_PRESETS,
  type StaticAdFormatPresetId,
} from '@/lib/studio/static-ads/format-presets'
import { commitHaptic } from '@/utils/haptics'
import {
  ArrowLeftRightIcon,
  BoxIcon,
  BrushIcon,
  CameraIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CirclePlayIcon,
  ClipboardListIcon,
  Columns2Icon,
  DumbbellIcon,
  HandIcon,
  HashIcon,
  LayoutGridIcon,
  LayersIcon,
  LaughIcon,
  MegaphoneIcon,
  MessageCircleIcon,
  PackageOpenIcon,
  QuoteIcon,
  SearchIcon,
  ShirtIcon,
  SparklesIcon,
  SplitIcon,
  StarIcon,
  TimerIcon,
  UserRoundIcon,
  ZapIcon,
  type LucideIcon,
} from 'lucide-react'
import { useStaticAdStudio } from './static-ad-studio-provider'

const PRESET_ICONS: Record<StaticAdFormatPresetId, LucideIcon> = {
  'ugc-hold': HandIcon,
  'ugc-fitness': DumbbellIcon,
  'ugc-selfie': CameraIcon,
  'reaction-hook': ZapIcon,
  'testimonial-ugc': UserRoundIcon,
  grwm: BrushIcon,
  unboxing: PackageOpenIcon,
  'demo-use': CirclePlayIcon,
  'flat-lay': LayoutGridIcon,
  'lifestyle-ritual': SparklesIcon,
  'product-hero': BoxIcon,
  'direct-response': MegaphoneIcon,
  'before-after-safe': SplitIcon,
  'before-after': Columns2Icon,
  'statistic-callout': HashIcon,
  'spec-callout': ClipboardListIcon,
  'countdown-urgency': TimerIcon,
  'review-screenshot': StarIcon,
  'text-message': MessageCircleIcon,
  'search-bar': SearchIcon,
  'comparison-vs': ArrowLeftRightIcon,
  'haul-tryon': ShirtIcon,
  'outfit-flatlay': LayersIcon,
  'founder-story': QuoteIcon,
  'meme-format': LaughIcon,
}

function PresetCarouselNav() {
  const { canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useCarousel()

  if (!canScrollPrev && !canScrollNext) return null

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        aria-label="Scroll presets left"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-full',
          'text-muted-foreground ring-1 ring-border/40',
          'transition-[color,background-color,opacity] duration-150',
          'hover:bg-muted/50 hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          'disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <ChevronLeftIcon className="size-3.5" strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="Scroll presets right"
        disabled={!canScrollNext}
        onClick={scrollNext}
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-full',
          'text-muted-foreground ring-1 ring-border/40',
          'transition-[color,background-color,opacity] duration-150',
          'hover:bg-muted/50 hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          'disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <ChevronRightIcon className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}

export function StaticAdFormatPresets() {
  const { applyFormatPreset, activePresetId } = useStaticAdStudio()

  return (
    <Carousel
      className="w-full min-w-0 self-stretch"
      opts={{
        align: 'start',
        dragFree: true,
        containScroll: 'trimSnaps',
      }}
    >
      <div className="mb-1.5 flex items-center justify-between gap-3 px-3 sm:px-3.5">
        <p className="text-[11px] font-medium tracking-[-0.01em] text-muted-foreground">
          Format starters
        </p>
        <div className="flex items-center gap-2">
          <p className="hidden text-[10px] text-muted-foreground/65 sm:block">
            Tap to apply — edit anytime
          </p>
          <PresetCarouselNav />
        </div>
      </div>

      <div className="relative w-full min-w-0">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-5 bg-linear-to-r from-background/95 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-linear-to-l from-background/95 to-transparent"
        />

        <CarouselContent
          className="ml-0 px-3 sm:px-3.5"
          role="listbox"
          aria-label="Format starters"
        >
          {STATIC_AD_FORMAT_PRESETS.map((preset, index) => {
            const Icon = PRESET_ICONS[preset.id] ?? SparklesIcon
            const isActive = activePresetId === preset.id

            return (
              <CarouselItem
                key={preset.id}
                className={cn(
                  'basis-auto self-stretch pl-0',
                  index > 0 && 'pl-1.5',
                  index === 0 && 'pl-0.5',
                )}
              >
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  title={preset.description}
                  onClick={() => {
                    applyFormatPreset(preset)
                    commitHaptic({ vibrateDuration: 8 })
                  }}
                  className={cn(
                    'inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-2.5',
                    'text-[11px] font-medium leading-none tracking-[-0.01em]',
                    'transition-[background-color,border-color,color,box-shadow,transform] duration-150',
                    'active:scale-[0.97]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                    isActive
                      ? 'border-foreground/20 bg-foreground text-background shadow-sm'
                      : 'border-border/40 bg-muted/40 text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="size-3 shrink-0 opacity-75" strokeWidth={2} aria-hidden />
                  <span className="whitespace-nowrap">{preset.label}</span>
                </button>
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </div>
    </Carousel>
  )
}
