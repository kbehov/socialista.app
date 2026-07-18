'use client'

import { CollapseAppSidebarOnMount } from '@/components/sidebars/collapse-app-sidebar-on-mount'
import { SlideshowStudioSidebar } from '@/components/carousel/slideshow-studio-sidebar'
import { CarouselEditor } from '@/components/carousel/carousel-editor'

export function SlideshowStudio() {
  return (
    <div className="slideshow-studio flex h-full max-h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden overscroll-none bg-background">
      <CollapseAppSidebarOnMount />
      <CarouselEditor panels={<SlideshowStudioSidebar className="hidden min-w-0 lg:flex" />} />
    </div>
  )
}
