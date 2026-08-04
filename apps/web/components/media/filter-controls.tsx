'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  useCarousel,
} from '@/components/ui/carousel'
import {
  getActiveMediaFilterPresetId,
  MEDIA_FILTER_PRESETS,
  type MediaFilterPreset,
} from '@/constants/media-filter-presets'
import { cn } from '@/lib/utils'
import { MEDIA_FILTER_DEFS, filtersToCss, type MediaFilter, type MediaFilterType } from '@/utils/media-filters'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { InspectorSlider } from './inspector-slider'

type FilterControlsProps = {
  filters: MediaFilter[]
  onChange: (filter: MediaFilter) => void
  onCommit?: (filter: MediaFilter) => void
  onRemove: (type: MediaFilterType) => void
  onRemoveCommit?: (type: MediaFilterType) => void
  /** Replace the full filter stack (used by Instagram-style presets). */
  onApplyFilters?: (filters: MediaFilter[]) => void
  /** Optional image shown in preset thumbnails. Falls back to a gradient swatch. */
  previewImageUrl?: string | null
}

function PresetCarouselNav() {
  const { canScrollPrev, canScrollNext, scrollPrev, scrollNext } = useCarousel()

  if (!canScrollPrev && !canScrollNext) return null

  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        aria-label="Scroll filters left"
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-full border border-border/50 bg-background text-muted-foreground shadow-xs',
          'transition-[color,background-color,opacity] duration-150',
          'hover:bg-muted hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          'disabled:pointer-events-none disabled:opacity-35',
        )}
      >
        <ChevronLeftIcon className="size-3.5" strokeWidth={2} />
      </button>
      <button
        type="button"
        aria-label="Scroll filters right"
        disabled={!canScrollNext}
        onClick={scrollNext}
        className={cn(
          'inline-flex size-6 items-center justify-center rounded-full border border-border/50 bg-background text-muted-foreground shadow-xs',
          'transition-[color,background-color,opacity] duration-150',
          'hover:bg-muted hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
          'disabled:pointer-events-none disabled:opacity-35',
        )}
      >
        <ChevronRightIcon className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}

function FilterPresetThumb({
  preset,
  previewImageUrl,
  isActive,
}: {
  preset: MediaFilterPreset
  previewImageUrl?: string | null
  isActive: boolean
}) {
  const filterCss = filtersToCss(preset.filters)

  return (
    <span
      className={cn(
        'relative block size-14 overflow-hidden rounded-lg border bg-muted shadow-xs',
        'transition-[border-color,box-shadow,transform] duration-150',
        isActive ? 'border-foreground ring-2 ring-foreground/80' : 'border-border/50',
      )}
    >
      {previewImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewImageUrl}
          alt=""
          aria-hidden
          className="size-full object-cover"
          style={{ filter: filterCss || undefined }}
          draggable={false}
        />
      ) : (
        <span
          aria-hidden
          className="block size-full bg-linear-to-br from-amber-200 via-rose-300 to-indigo-400"
          style={{ filter: filterCss || undefined }}
        />
      )}
    </span>
  )
}

function FilterPresetCarousel({
  filters,
  onApplyFilters,
  previewImageUrl,
}: {
  filters: MediaFilter[]
  onApplyFilters: (filters: MediaFilter[]) => void
  previewImageUrl?: string | null
}) {
  const activePresetId = getActiveMediaFilterPresetId(filters)
  const presetCount = MEDIA_FILTER_PRESETS.length

  return (
    <Carousel
      className="w-full min-w-0"
      opts={{
        align: 'start',
        dragFree: true,
        containScroll: 'trimSnaps',
      }}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="text-xs font-medium text-muted-foreground">Presets</div>
        <PresetCarouselNav />
      </div>

      <CarouselContent className="ml-0" role="listbox" aria-label="Filter presets">
        {MEDIA_FILTER_PRESETS.map((preset, index) => {
          const isActive = activePresetId === preset.id

          return (
            <CarouselItem
              key={preset.id}
              className={cn(
                'basis-auto pl-0',
                index > 0 && 'pl-2',
                index === presetCount - 1 && 'pr-1',
              )}
            >
              <button
                type="button"
                role="option"
                aria-selected={isActive}
                aria-label={`Apply ${preset.label} filter`}
                onClick={() => onApplyFilters(preset.filters.map(f => ({ ...f })))}
                className={cn(
                  'flex w-14 flex-col items-center gap-1 rounded-md text-left',
                  'transition-transform duration-150 active:scale-[0.97]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                )}
              >
                <FilterPresetThumb
                  preset={preset}
                  previewImageUrl={previewImageUrl}
                  isActive={isActive}
                />
                <span
                  className={cn(
                    'w-full truncate text-center text-[10px] leading-tight tracking-tight',
                    isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                  )}
                >
                  {preset.label}
                </span>
              </button>
            </CarouselItem>
          )
        })}
      </CarouselContent>
    </Carousel>
  )
}

export function FilterControls({
  filters,
  onChange,
  onCommit,
  onRemove,
  onRemoveCommit,
  onApplyFilters,
  previewImageUrl,
}: FilterControlsProps) {
  return (
    <div className="my-2 flex flex-col gap-3">
      {onApplyFilters ? (
        <FilterPresetCarousel
          filters={filters}
          onApplyFilters={onApplyFilters}
          previewImageUrl={previewImageUrl}
        />
      ) : null}

      <div className="text-xs font-medium text-muted-foreground">Adjust</div>
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
