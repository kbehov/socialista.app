'use client'

import { CarouselEditor } from '@/components/carousel/carousel-editor'
import { SlideshowGeneratorPanel } from '@/components/carousel/slideshow-generator-panel'

export function SlideshowStudio() {
  return (
    <div className="flex min-h-[calc(100svh-8rem)] flex-col gap-4">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Slideshow studio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate carousel copy with AI, then design slides for any social format.
        </p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[minmax(280px,340px)_1fr] lg:items-stretch">
        <SlideshowGeneratorPanel />
        <div className="min-h-0 overflow-hidden">
          <CarouselEditor />
        </div>
      </div>
    </div>
  )
}
