'use client'

import { SlideshowSourcePanel } from '@/components/carousel/slideshow-source-panel'
import { CarouselEditor } from '@/components/carousel/carousel-editor'
import { FormatSelector } from '@/components/carousel/format-selector'

export function SlideshowStudio() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <header className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Slideshow studio</h1>
          <p className="mt-1 hidden max-w-2xl text-sm text-muted-foreground sm:block">
            Generate copy with AI, import from TikTok, design slides on the canvas, then export a ZIP of images.
          </p>
        </div>
        <FormatSelector className="w-full sm:w-auto sm:shrink-0" />
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden lg:grid-cols-[minmax(280px,340px)_minmax(0,1fr)] lg:grid-rows-1">
        <div className="max-h-[min(320px,36vh)] min-h-0 overflow-hidden lg:max-h-none lg:h-full">
          <SlideshowSourcePanel />
        </div>
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <CarouselEditor />
        </div>
      </div>
    </div>
  )
}
