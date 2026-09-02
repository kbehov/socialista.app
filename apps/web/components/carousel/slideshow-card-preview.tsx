'use client'

import type { CanvasDimensions, Slide } from '@socialista/types'
import { ImagesIcon, LayersIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { normalizeSlide } from '@/lib/carousel/defaults'
import { SlideCanvas } from './slide-canvas'

type SlideshowCardPreviewProps = {
  slide?: Slide
  canvas: CanvasDimensions
  className?: string
}

export function SlideshowCardPreview({ slide, canvas, className }: SlideshowCardPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const update = () => {
      const width = Math.round(element.clientWidth)
      setContainerWidth(prev => (prev === width ? prev : width))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [canvas.width, canvas.height])

  const forceWidth = containerWidth > 0 ? containerWidth : 1

  if (!slide) {
    return (
      <div
        ref={containerRef}
        className={cn(
          'flex size-full flex-col items-center justify-center gap-1.5 bg-neutral-950 text-white/40',
          className,
        )}
      >
        <ImagesIcon className="size-4 opacity-70" strokeWidth={1.5} />
        <span className="text-[10px] font-medium tracking-[-0.01em]">No preview</span>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={cn('relative size-full bg-black', className)}>
      {containerWidth > 0 ? (
        <SlideCanvas
          slide={normalizeSlide(slide)}
          interactive={false}
          canvasDimensions={canvas}
          forceWidth={forceWidth}
          className="pointer-events-none size-full"
        />
      ) : null}
    </div>
  )
}

export function SlideshowCardStoryBars({ slideCount, className }: { slideCount: number; className?: string }) {
  if (slideCount <= 1) return null

  const segments = Math.min(slideCount, 12)

  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-x-2.5 top-2 z-20 flex gap-[3px]',
        'drop-shadow-[0_1px_1px_rgba(0,0,0,0.45)]',
        className,
      )}
    >
      {Array.from({ length: segments }, (_, index) => (
        <div
          key={index}
          className={cn(
            'h-[2px] flex-1 rounded-full',
            index === 0 ? 'bg-white' : 'bg-white/35',
          )}
        />
      ))}
    </div>
  )
}

export function SlideshowCardSlideBadge({
  slideCount,
  className,
}: {
  slideCount: number
  className?: string
}) {
  if (slideCount <= 0) return null

  return (
    <span
      className={cn(
        'pointer-events-none absolute right-2 bottom-2 z-20 inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm',
        className,
      )}
    >
      <LayersIcon className="size-3" strokeWidth={2} />
      {slideCount}
    </span>
  )
}
