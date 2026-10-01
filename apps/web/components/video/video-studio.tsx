'use client'

import { videoStudioRootClassName } from '@/components/dashboard/studio-shell'
import { CollapseAppSidebarOnMount } from '@/components/sidebars/collapse-app-sidebar-on-mount'
import { VideoEditor } from '@/components/video/video-editor'
import { VideoInspectorPanel } from '@/components/video/inspector/inspector-panel'
import {
  VideoStudioMobileSheet,
  VideoStudioSidebar,
} from '@/components/video/video-studio-sidebar'

export function VideoStudio() {
  return (
    <div className={videoStudioRootClassName}>
      <CollapseAppSidebarOnMount />
      <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:flex-row">
        <VideoStudioSidebar className="hidden min-w-0 lg:flex" />

        <main className="video-editor-main flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <VideoEditor />
        </main>

        <VideoInspectorPanel />
      </div>
      <VideoStudioMobileSheet />
    </div>
  )
}
