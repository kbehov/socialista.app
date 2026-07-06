'use client'

import { CarouselEditor } from '@/components/carousel/carousel-editor'
import { SlideshowStudioMobilePanel, SlideshowStudioSidebar } from '@/components/carousel/slideshow-studio-sidebar'
import { CollapseAppSidebarOnMount } from '@/components/collapse-app-sidebar-on-mount'

export function SlideshowStudio() {
  return (
    <div className="slideshow-studio flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <CollapseAppSidebarOnMount />
      <CarouselEditor
        panels={
          <>
            <SlideshowStudioSidebar className="hidden min-w-0 lg:flex" />
            <SlideshowStudioMobilePanel className="lg:hidden" />
          </>
        }
      />
    </div>
  )
}
