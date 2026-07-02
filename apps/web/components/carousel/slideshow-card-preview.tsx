'use client'

import type { CanvasDimensions, Slide } from '@socialista/types'
import { ImagesIcon } from 'lucide-react'
import { SlideCanvas } from './slide-canvas'

type SlideshowCardPreviewProps = {
  slide?: Slide
  canvas: CanvasDimensions
}

export function SlideshowCardPreview({ slide, canvas }: SlideshowCardPreviewProps) {
  const aspectRatio = canvas.width / canvas.height

  if (!slide) {
    return (
      <div
        className="flex w-full flex-col items-center justify-center gap-2 bg-muted text-muted-foreground"
        style={{ aspectRatio }}
      >
        <ImagesIcon className="size-8 opacity-60" />
        <span className="text-xs">Empty slideshow</span>
      </div>
    )
  }

  return (
    <div className="relative w-full overflow-hidden bg-muted" style={{ aspectRatio }}>
      <SlideCanvas
        slide={slide}
        interactive={false}
        canvasDimensions={canvas}
        className="pointer-events-none size-full min-h-0"
      />
    </div>
  )
}
