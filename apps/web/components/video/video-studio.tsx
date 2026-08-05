'use client'

import { CollapseAppSidebarOnMount } from '@/components/sidebars/collapse-app-sidebar-on-mount'
import { VideoEditor } from '@/components/video/video-editor'
import { VideoInspectorPanel } from '@/components/video/inspector/inspector-panel'
import { VideoSourcePanel } from '@/components/video/video-source-panel'
import { VideoStudioSidebar } from '@/components/video/video-studio-sidebar'

export function VideoStudio() {
  return (
    <div className="video-studio flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background text-foreground">
      <CollapseAppSidebarOnMount />
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <VideoStudioSidebar className="hidden min-w-0 lg:flex" />

        <aside className="studio-source-panel flex max-h-[min(240px,26vh)] min-h-0 w-full shrink-0 flex-col overflow-hidden border-b bg-background lg:hidden">
          <VideoSourcePanel />
        </aside>

        <main className="video-editor-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <VideoEditor />
        </main>

        <VideoInspectorPanel />
      </div>
    </div>
  )
}
