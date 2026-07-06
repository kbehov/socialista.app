'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useCarouselPreviewLayout } from '@/components/carousel/carousel-preview-layout'
import { CAROUSEL_PEEK_WIDTH_RATIO } from '@/lib/carousel/canvas-viewport'
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
  canvasHint?: string | null
}

function SlideCarouselItem({
  slide,
  index,
  isActive,
  canvasHint,
  onActivate,
}: {
  slide: ReturnType<typeof useEditorStore.getState>['slides'][number]
  index: number
  isActive: boolean
  canvasHint?: string | null
  onActivate: () => void
}) {
  const layout = useCarouselPreviewLayout()
  const peekWidth = layout ? Math.max(48, Math.round(layout.baseWidth * CAROUSEL_PEEK_WIDTH_RATIO)) : undefined

  return (
    <div
      className={cn(
        'flex h-full w-full items-center justify-center overflow-visible transition-[opacity,transform] duration-300 ease-out',
        isActive ? 'scale-100 opacity-100' : 'scale-[0.9] opacity-65',
      )}
    >
      <div
        role="presentation"
        onClick={isActive ? undefined : onActivate}
        className={cn(
          'overflow-visible rounded-lg transition-shadow duration-300',
          isActive ? 'cursor-default shadow-lg ring-1 ring-border/40' : 'cursor-pointer',
        )}
      >
        <SlideCanvasShell
          slide={slide}
          interactive={isActive}
          forceWidth={isActive ? undefined : peekWidth}
          canvasHint={isActive ? canvasHint : undefined}
        />
      </div>
      {!isActive ? (
        <span className="sr-only">Slide {index + 1}, click or drag to select</span>
      ) : null}
    </div>
  )
}

export function SlidePreviewCarousel({ className, canvasHint }: SlidePreviewCarouselProps) {
  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const canvas = useEditorStore(s => s.canvas)
  const setActiveSlide = useEditorStore(s => s.setActiveSlide)
  const { adjustTarget } = useSlideImageEdit()

  const [api, setApi] = useState<CarouselApi>()
  const [currentIndex, setCurrentIndex] = useState(0)

  const activeIndex = slides.findIndex(slide => slide.id === activeSlideId)
  const canvasKey = `${canvas.width}x${canvas.height}`
  const hasMultipleSlides = slides.length > 1

  const carouselOpts = useMemo(
    () => ({
      align: 'center' as const,
      containScroll: 'trimSnaps' as const,
      dragFree: false,
      slidesToScroll: 1,
    }),
    [],
  )

  const itemBasisClass = hasMultipleSlides ? 'basis-[78%] sm:basis-[72%] lg:basis-[68%]' : 'basis-full'

  const handleActivate = useCallback(
    (slideId: string, index: number) => {
      if (slideId === activeSlideId) return
      setActiveSlide(slideId)
      api?.scrollTo(index, true)
    },
    [activeSlideId, api, setActiveSlide],
  )

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
      api.scrollTo(activeIndex, true)
    }
    setCurrentIndex(activeIndex)
  }, [api, activeIndex])

  useEffect(() => {
    if (!api) return
    api.reInit()
  }, [api, slides.map(slide => slide.id).join(','), canvasKey, hasMultipleSlides])

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
    <Carousel
      setApi={setApi}
      draggable={!adjustTarget}
      opts={carouselOpts}
      className={cn(
        'relative flex h-full min-h-0 w-full min-w-0 cursor-grab flex-col overflow-hidden active:cursor-grabbing',
        className,
      )}
    >
      {hasMultipleSlides ? (
        <>
          <div className="pointer-events-none absolute inset-x-4 top-3 z-20 flex gap-1">
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

          <div className="pointer-events-none absolute top-3 right-3 z-20">
            <span className="rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground shadow-sm backdrop-blur-sm">
              {currentIndex + 1} / {slides.length}
            </span>
          </div>
        </>
      ) : null}

      <CarouselContent className="ml-0 h-full min-h-0 flex-1 items-center px-2">
        {slides.map((slide, index) => {
          const isActive = slide.id === activeSlideId

          return (
            <CarouselItem key={slide.id} className={cn('h-full min-h-0 pl-0', itemBasisClass)}>
              <SlideCarouselItem
                slide={slide}
                index={index}
                isActive={isActive}
                canvasHint={canvasHint}
                onActivate={() => handleActivate(slide.id, index)}
              />
            </CarouselItem>
          )
        })}
      </CarouselContent>

      {hasMultipleSlides ? (
        <>
          <CarouselPrevious
            data-carousel-nav
            variant="ghost"
            className="top-1/2 left-2 z-20 size-9 -translate-y-1/2 rounded-full border-0 bg-background/85 shadow-md backdrop-blur-sm hover:bg-background disabled:opacity-30"
          />
          <CarouselNext
            data-carousel-nav
            variant="ghost"
            className="top-1/2 right-2 left-auto z-20 size-9 -translate-y-1/2 rounded-full border-0 bg-background/85 shadow-md backdrop-blur-sm hover:bg-background disabled:opacity-30"
          />
        </>
      ) : null}
    </Carousel>
  )
}
