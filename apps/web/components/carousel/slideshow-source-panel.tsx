'use client'

import { SlideshowGeneratorPanel } from '@/components/carousel/slideshow-generator-panel'
import { StudioPanelHeader } from '@/components/carousel/studio-segmented-tabs'

export function SlideshowSourcePanel({
  embedded = false,
  showPanelHeader,
}: {
  embedded?: boolean
  showPanelHeader?: boolean
}) {
  const panelHeaderVisible = showPanelHeader ?? embedded

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      {panelHeaderVisible ? (
        <div className="shrink-0 border-b border-border/40 px-3.5 py-2.5">
          <StudioPanelHeader
            title="Create"
            description="Describe your topic and directions — AI will draft your carousel pages"
          />
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden bg-background">
        <SlideshowGeneratorPanel embedded />
      </div>
    </div>
  )
}
