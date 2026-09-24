'use client'

import { useSlideshowStudio } from '@/components/studio/slideshows/slideshow-studio-provider'
import { Carousel, CarouselContent, CarouselItem, useCarousel } from '@/components/ui/carousel'
import { PresetCard } from '@/components/ui/card'
import { mapPresetToFeatureCard } from '@/lib/studio/preset-media'
import { cn } from '@/lib/utils'
import type { Preset } from '@socialista/types'
import { ChevronRightIcon } from 'lucide-react'
import { useMemo } from 'react'

function PresetRowNav() {
  const { canScrollNext, scrollNext } = useCarousel()

  if (!canScrollNext) return null

  return (
    <button
      type="button"
      aria-label="Scroll presets right"
      onClick={scrollNext}
      className={cn(
        'absolute top-[calc(50%-1.65rem)] right-0 z-20 -translate-y-1/2',
        'inline-flex size-8 items-center justify-center rounded-full',
        'bg-background text-foreground/70 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_0_0_1px_rgba(0,0,0,0.06)]',
        'transition-[background-color,color,transform,box-shadow] duration-150 ease-[cubic-bezier(0.2,0,0,1)]',
        'hover:text-foreground hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.08)]',
        'active:scale-[0.96] motion-reduce:active:scale-100',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',
        'dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.1)]',
      )}
    >
      <ChevronRightIcon className="size-4" strokeWidth={1.75} />
    </button>
  )
}

export function SlideshowPresetRow({ presets }: { presets: Preset[] }) {
  const { applyPreset } = useSlideshowStudio()
  const cards = useMemo(() => presets.map(mapPresetToFeatureCard), [presets])

  if (cards.length === 0) return null

  return (
    <section aria-label="Presets" className="relative z-10 mx-auto mt-2 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
      <h2 className="mb-3 text-[13px] font-medium leading-none tracking-[-0.011em] text-black/56 dark:text-white/56">
        Presets
      </h2>
      <Carousel
        className="w-full min-w-0"
        opts={{
          align: 'start',
          dragFree: true,
          containScroll: 'trimSnaps',
        }}
      >
        <div className="relative w-full min-w-0 pr-10">
          <CarouselContent className="-ml-2.5 ml-0">
            {cards.map(card => (
              <CarouselItem key={card.id} className="basis-auto pl-2.5">
                <PresetCard
                  title={card.title}
                  description={card.description}
                  image={card.image}
                  imagePosition={card.imagePosition}
                  previewClassName={card.previewClassName}
                  onSelect={() => {
                    const preset = presets.find(item => item._id === card.id)
                    if (preset) applyPreset(preset)
                  }}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <PresetRowNav />
        </div>
      </Carousel>
    </section>
  )
}
