'use client'

import { MediaPool } from '@/components/video/media-pool'
import { StudioPanelHeader } from '@/components/carousel/studio-segmented-tabs'

export function VideoSourcePanel() {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="shrink-0 border-b border-border/40 px-3.5 py-3">
        <StudioPanelHeader
          title="Media"
          description="Import files, library assets, or a URL"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <MediaPool embedded />
      </div>
    </div>
  )
}
