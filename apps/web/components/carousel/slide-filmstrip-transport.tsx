'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useEditorStore } from '@/lib/carousel/store'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  TypeIcon,
} from 'lucide-react'

type SlideFilmstripTransportProps = {
  onAddText: () => void
}

export function SlideFilmstripTransport({ onAddText }: SlideFilmstripTransportProps) {
  const slides = useEditorStore(s => s.slides)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const setActiveSlide = useEditorStore(s => s.setActiveSlide)
  const addSlide = useEditorStore(s => s.addSlide)

  const activeIndex = slides.findIndex(slide => slide.id === activeSlideId)
  const currentIndex = activeIndex >= 0 ? activeIndex : 0
  const slideCount = slides.length
  const hasSlides = slideCount > 0
  const canGoPrev = currentIndex > 0
  const canGoNext = currentIndex < slideCount - 1

  const goToPrev = () => {
    if (!canGoPrev) return
    const slide = slides[currentIndex - 1]
    if (slide) setActiveSlide(slide.id)
  }

  const goToNext = () => {
    if (!canGoNext) return
    const slide = slides[currentIndex + 1]
    if (slide) setActiveSlide(slide.id)
  }

  return (
    <div
      data-carousel-nav
      className="slideshow-editor-transport video-editor-transport flex min-w-0 shrink-0 items-center gap-1.5 overflow-x-auto border-b px-2 py-1.5 sm:gap-2 sm:px-3"
    >
      <div className="flex shrink-0 items-center gap-0.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              className="size-8"
              onClick={onAddText}
              disabled={!hasSlides}
            >
              <TypeIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add text to slide</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="button" size="icon-sm" variant="ghost" className="size-8" onClick={() => addSlide()}>
              <PlusIcon className="size-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add slide</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center gap-1">
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="size-7 shrink-0"
          onClick={goToPrev}
          disabled={!canGoPrev}
          aria-label="Previous slide"
        >
          <ChevronLeftIcon className="size-3.5" />
        </Button>

        <div className="flex items-center gap-1 rounded-md border border-border/50 bg-background/60 px-2.5 py-1 text-xs tabular-nums">
          <span className="font-semibold text-foreground">{hasSlides ? currentIndex + 1 : 0}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{slideCount}</span>
        </div>

        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          className="size-7 shrink-0"
          onClick={goToNext}
          disabled={!canGoNext}
          aria-label="Next slide"
        >
          <ChevronRightIcon className="size-3.5" />
        </Button>
      </div>

      <span className="hidden shrink-0 text-[10px] text-muted-foreground sm:inline">Drag slides to reorder</span>
    </div>
  )
}
