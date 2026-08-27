'use client'

import { MediaPool } from '@/components/video/media-pool'
import { EditorPanelHeader } from '@/components/editor/panel-shell'

export function VideoSourcePanel({
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
          <EditorPanelHeader
            title="Media"
            description="Upload, library, Pixabay, or paste a URL"
          />
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden">
        <MediaPool />
      </div>
    </div>
  )
}
