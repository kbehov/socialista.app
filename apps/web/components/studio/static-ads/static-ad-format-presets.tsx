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
import { StudioHomeSectionHeader } from '@/components/studio/studio-home-section-header'
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

function PresetCarouselNav({ compact }: { compact?: boolean }) {
  const { canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useCarousel()

  if (!canScrollPrev && !canScrollNext) return null

  const buttonClass = cn(
    'inline-flex items-center justify-center rounded-full bg-background',
    'text-black/50 dark:text-white/50',
    'ring-1 ring-inset ring-border',
    'transition-[background-color,color,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
    'hover:text-foreground hover:ring-foreground/15 dark:hover:ring-white/20',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
    'active:scale-[0.96] motion-reduce:active:scale-100',
    'disabled:pointer-events-none disabled:opacity-30',
    compact ? 'size-6' : 'size-8',
  )

  const iconClass = compact ? 'size-3' : 'size-3.5'

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button type="button" aria-label="Scroll formats left" disabled={!canScrollPrev} onClick={scrollPrev} className={buttonClass}>
        <ChevronLeftIcon className={iconClass} strokeWidth={1.75} />
      </button>
      <button type="button" aria-label="Scroll formats right" disabled={!canScrollNext} onClick={scrollNext} className={buttonClass}>
        <ChevronRightIcon className={iconClass} strokeWidth={1.75} />
      </button>
    </div>
  )
}

type StaticAdFormatPresetsProps = {
  compact?: boolean
}

export function StaticAdFormatPresets({ compact = false }: StaticAdFormatPresetsProps) {
  const { applyFormatPreset, activePresetId } = useStaticAdStudio()

  const chipClass = (isActive: boolean) =>
    cn(
      'inline-flex shrink-0 items-center rounded-full font-medium leading-none tracking-[-0.015em]',
      'transition-[background-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
      'active:scale-[0.96] motion-reduce:active:scale-100',
      compact
        ? 'h-7 gap-1 px-2.5 text-[11px]'
        : 'h-8 gap-1.5 px-3.5 text-[13px]',
      isActive
        ? 'bg-foreground text-background shadow-[0_1px_2px_rgba(0,0,0,0.16),inset_0_1px_0_0_rgba(255,255,255,0.2)]'
        : cn(
            'bg-background text-foreground/72 ring-1 ring-inset ring-border',
            'hover:text-foreground hover:ring-foreground/15 dark:hover:ring-white/20',
          ),
    )

  const iconSize = compact ? 'size-3' : 'size-3.5'
  const chipGap = compact ? 'pl-1.5' : 'pl-2'

  return (
    <Carousel
      className="w-full min-w-0"
      opts={{
        align: 'start',
        dragFree: true,
        containScroll: 'trimSnaps',
      }}
    >
      {!compact ? (
        <StudioHomeSectionHeader
          className="mb-3"
          title="Formats"
          description="Quick-start layouts — tap one to prefill the prompt."
        />
      ) : null}

      <div className="flex items-center gap-1.5">
        <div className="relative min-w-0 flex-1">
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
                  className={cn('basis-auto self-stretch pl-0', index > 0 && chipGap)}
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
                    className={chipClass(isActive)}
                  >
                    <Icon className={cn(iconSize, 'shrink-0 opacity-70')} strokeWidth={1.75} aria-hidden />
                    <span className="whitespace-nowrap">{preset.label}</span>
                  </button>
                </CarouselItem>
              )
            })}
          </CarouselContent>
        </div>
        <PresetCarouselNav compact={compact} />
      </div>
    </Carousel>
  )
}
