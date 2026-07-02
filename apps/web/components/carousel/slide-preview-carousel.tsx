'use client'

import { useEffect, useState } from 'react'
import { useEditorStore } from '@/lib/carousel/store'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { SlideCanvasShell } from './slide-canvas-shell'
import { useSlideImageEdit } from './slide-image-edit-provider'

type SlidePreviewCarouselProps = {
  className?: string
}

export function SlidePreviewCarousel({ className }: SlidePreviewCarouselProps) {
  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const canvas = useEditorStore(s => s.canvas)
  const setActiveSlide = useEditorStore(s => s.setActiveSlide)
  const { adjustTarget } = useSlideImageEdit()

  const [api, setApi] = useState<CarouselApi>()
  const [currentIndex, setCurrentIndex] = useState(0)

  const activeIndex = slides.findIndex(slide => slide.id === activeSlideId)

  useEffect(() => {
    if (!api) return

    const onSelect = () => {
      const index = api.selectedScrollSnap()
      setCurrentIndex(index)
      const slideId = slides[index]?.id
      if (slideId && slideId !== useEditorStore.getState().activeSlideId) {
        setActiveSlide(slideId)
      }
    }

    onSelect()
    api.on('select', onSelect)
    api.on('reInit', onSelect)

    return () => {
      api.off('select', onSelect)
      api.off('reInit', onSelect)
    }
  }, [api, slides, setActiveSlide])

  useEffect(() => {
    if (!api || activeIndex < 0) return
    if (api.selectedScrollSnap() !== activeIndex) {
      api.scrollTo(activeIndex)
    }
    setCurrentIndex(activeIndex)
  }, [api, activeIndex, activeSlideId])

  useEffect(() => {
    if (!api) return
    api.reInit()
  }, [api, slides.map(slide => slide.id).join(','), canvas.width, canvas.height])

  if (slides.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium text-muted-foreground">No slides yet</p>
        <p className="max-w-xs text-xs text-muted-foreground/80">
          Use AI generate or TikTok import to create your first slides.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Carousel
        setApi={setApi}
        draggable={!adjustTarget}
        opts={{ align: 'center', containScroll: 'trimSnaps', dragFree: false }}
        className={cn('relative w-full cursor-grab active:cursor-grabbing', className)}
      >
      {slides.length > 1 ? (
        <>
          <div className="pointer-events-none absolute inset-x-4 top-3 z-20 flex gap-1 sm:inset-x-5">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={cn(
                  'h-1 flex-1 rounded-full transition-all duration-200',
                  index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/25',
                )}
              />
            ))}
          </div>

          <div className="pointer-events-none absolute top-3 right-3 z-20 sm:top-4 sm:right-4">
            <span className="rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground shadow-sm backdrop-blur-sm">
              {currentIndex + 1} / {slides.length}
            </span>
          </div>
        </>
      ) : null}

      <CarouselContent className="ml-0">
        {slides.map(slide => (
          <CarouselItem key={slide.id} className="pl-0">
            <div className="flex w-full justify-center px-1 py-1">
              <SlideCanvasShell
                slide={slide}
                interactive={slide.id === activeSlideId}
                className="w-full max-w-full"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {slides.length > 1 ? (
        <>
          <CarouselPrevious
            variant="ghost"
            className="top-1/2 left-2 z-20 size-9 -translate-y-1/2 rounded-full border-0 bg-background/85 shadow-md backdrop-blur-sm hover:bg-background disabled:opacity-30"
          />
          <CarouselNext
            variant="ghost"
            className="top-1/2 right-2 left-auto z-20 size-9 -translate-y-1/2 rounded-full border-0 bg-background/85 shadow-md backdrop-blur-sm hover:bg-background disabled:opacity-30"
          />
        </>
      ) : null}
      </Carousel>
    </div>
  )
}
