'use client'

import { slideshowStudioRootClassName } from '@/components/dashboard/studio-shell'
import { CarouselEditor } from '@/components/carousel/carousel-editor'
import { SlideshowStudioSidebar } from '@/components/carousel/slideshow-studio-sidebar'
import { CollapseAppSidebarOnMount } from '@/components/sidebars/collapse-app-sidebar-on-mount'

export function SlideshowStudio() {
  return (
    <div className={slideshowStudioRootClassName}>
      <CollapseAppSidebarOnMount />
      <CarouselEditor panels={<SlideshowStudioSidebar className="hidden min-w-0 lg:flex" />} />
    </div>
  )
}
