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

type SlidePreviewCarouselProps = {
  maxWidth?: number
  className?: string
}

export function SlidePreviewCarousel({ maxWidth = 560, className }: SlidePreviewCarouselProps) {
  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const setActiveSlide = useEditorStore(s => s.setActiveSlide)

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
  }, [api, slides.map(slide => slide.id).join(',')])

  if (slides.length === 0) {
    return <p className="text-sm text-muted-foreground">No slides yet</p>
  }

  return (
    <Carousel
      setApi={setApi}
      draggable
      opts={{ align: 'center', containScroll: 'trimSnaps' }}
      className={cn('relative h-full w-full cursor-grab active:cursor-grabbing', className)}
    >
      {slides.length > 1 && (
        <div className="pointer-events-none absolute inset-x-3 top-2 z-20 flex gap-0.5 sm:inset-x-4">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                'h-0.5 flex-1 rounded-full transition-colors',
                index === currentIndex ? 'bg-primary' : 'bg-muted-foreground/30',
              )}
            />
          ))}
        </div>
      )}

      <CarouselContent className="ml-0 h-full">
        {slides.map(slide => (
          <CarouselItem key={slide.id} className="h-full pl-0">
            <div className="flex h-full items-center justify-center">
              <div className="h-full w-full" style={{ maxWidth }}>
                <SlideCanvasShell
                  slide={slide}
                  interactive={slide.id === activeSlideId}
                  maxWidth={maxWidth}
                  className="h-full"
                />
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {slides.length > 1 && (
        <>
          <CarouselPrevious
            variant="ghost"
            className="top-1/2 left-1.5 z-20 size-8 -translate-y-1/2 border-0 bg-background/80 shadow-sm backdrop-blur-sm hover:bg-background disabled:opacity-40"
          />
          <CarouselNext
            variant="ghost"
            className="top-1/2 right-1.5 left-auto z-20 size-8 -translate-y-1/2 border-0 bg-background/80 shadow-sm backdrop-blur-sm hover:bg-background disabled:opacity-40"
          />
        </>
      )}
    </Carousel>
  )
}
