'use client'

import { CarouselEditor } from '@/components/carousel/carousel-editor'
import { FormatSelector } from '@/components/carousel/format-selector'
import { SlideshowSaveBar } from '@/components/carousel/slideshow-save-bar'
import { SlideshowSourcePanel } from '@/components/carousel/slideshow-source-panel'
import { ImagesIcon } from 'lucide-react'

export function SlideshowStudio() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden pb-12">
      <header className="flex shrink-0 flex-col gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ImagesIcon className="size-4" />
          </span>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight sm:text-xl">Slideshow editor</h1>
            <p className="truncate text-xs text-muted-foreground">
              Generate slides, fine-tune images, style text, export ZIP
            </p>
          </div>
        </div>
        <div className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
          <FormatSelector className="w-full shrink-0 sm:max-w-[260px]" />
          <div className="min-w-0 flex-1">
            <SlideshowSaveBar />
          </div>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden rounded-xl border bg-muted/15 shadow-sm lg:grid-cols-[minmax(280px,320px)_minmax(0,1fr)]">
        <aside className="flex max-h-[min(240px,24vh)] min-h-0 flex-col overflow-hidden border-b lg:max-h-none lg:border-b-0 lg:border-r">
          <SlideshowSourcePanel />
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-lg bg-card lg:rounded-none">
          <CarouselEditor />
        </section>
      </div>
    </div>
  )
}
