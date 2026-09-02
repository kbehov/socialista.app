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
        aria-label="Scroll formats left"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-md',
          'text-black/44 dark:text-white/44',
          'transition-colors duration-150',
          'hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/[0.08]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/45',
          'disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <ChevronLeftIcon className="size-3.5" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label="Scroll formats right"
        disabled={!canScrollNext}
        onClick={scrollNext}
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-md',
          'text-black/44 dark:text-white/44',
          'transition-colors duration-150',
          'hover:bg-black/[0.05] hover:text-foreground dark:hover:bg-white/[0.08]',
          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/45',
          'disabled:pointer-events-none disabled:opacity-30',
        )}
      >
        <ChevronRightIcon className="size-3.5" strokeWidth={1.75} />
      </button>
    </div>
  )
}

export function StaticAdFormatPresets() {
  const { applyFormatPreset, activePresetId } = useStaticAdStudio()

  return (
    <Carousel
      className="w-full min-w-0"
      opts={{
        align: 'start',
        dragFree: true,
        containScroll: 'trimSnaps',
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-[12px] font-medium tracking-[-0.015em] text-foreground/80">Formats</p>
        <PresetCarouselNav />
      </div>

      <div className="relative w-full min-w-0">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-4 bg-linear-to-r from-background to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-6 bg-linear-to-l from-background to-transparent"
        />

        <CarouselContent className="ml-0" role="listbox" aria-label="Format starters">
          {STATIC_AD_FORMAT_PRESETS.map((preset, index) => {
            const Icon = PRESET_ICONS[preset.id] ?? SparklesIcon
            const isActive = activePresetId === preset.id

            return (
              <CarouselItem
                key={preset.id}
                className={cn('basis-auto self-stretch pl-0', index > 0 && 'pl-1.5')}
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
                    'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border px-2.5',
                    'text-[11px] font-medium leading-none tracking-[-0.015em]',
                    'transition-[background-color,border-color,color,transform] duration-150',
                    'active:scale-[0.97] motion-reduce:active:scale-100',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring/45',
                    isActive
                      ? 'border-black/18 bg-black/[0.06] text-foreground dark:border-white/18 dark:bg-white/[0.08]'
                      : 'border-black/10 bg-black/[0.02] text-black/56 hover:border-black/18 hover:bg-black/[0.05] hover:text-foreground dark:border-white/12 dark:bg-white/[0.03] dark:text-white/56 dark:hover:border-white/18 dark:hover:bg-white/[0.06]',
                  )}
                >
                  <Icon className="size-3 shrink-0 opacity-70" strokeWidth={1.75} aria-hidden />
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
