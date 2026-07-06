'use client'

import { CarouselEditor } from '@/components/carousel/carousel-editor'
import { FormatSelector } from '@/components/carousel/format-selector'
import { SlideshowSaveBar } from '@/components/carousel/slideshow-save-bar'
import { SlideshowSourcePanel } from '@/components/carousel/slideshow-source-panel'
import { CollapseAppSidebarOnMount } from '@/components/collapse-app-sidebar-on-mount'
import { ImagesIcon } from 'lucide-react'

export function SlideshowStudio() {
  return (
    <div className="studio-shell flex min-h-0 flex-1 flex-col overflow-hidden">
      <CollapseAppSidebarOnMount />
      <header className="studio-header shrink-0 border-b border-border/70 px-0.5 py-1">
        <div className="flex flex-col gap-1.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
              <ImagesIcon className="size-3.5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold tracking-tight">Slideshow editor</h1>
              <p className="hidden text-[11px] text-muted-foreground sm:block">Generate, style, and export</p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2 lg:shrink-0">
            <FormatSelector showLabel={false} className="w-full shrink-0 sm:w-[min(100%,220px)]" />
            <SlideshowSaveBar showLabel={false} className="min-w-0 flex-1 lg:max-w-xs lg:flex-initial" />
          </div>
        </div>
      </header>

      <div className="studio-workspace grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[minmax(240px,280px)_minmax(0,1fr)]">
        <aside className="studio-source-panel flex max-h-[min(280px,28vh)] min-h-0 flex-col overflow-hidden border-b lg:max-h-none lg:border-b-0 lg:border-r">
          <SlideshowSourcePanel />
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-card">
          <CarouselEditor />
        </section>
      </div>
    </div>
  )
}
