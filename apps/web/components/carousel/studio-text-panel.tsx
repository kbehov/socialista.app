'use client'

import {
  StudioTextAddPanel,
  StudioTextNoTargetEmpty,
} from '@/components/editor/studio-text-add-panel'
import { useEditorStore } from '@/lib/carousel/store'

export function StudioTextPanel({
  embedded = false,
  showPanelHeader,
}: {
  embedded?: boolean
  showPanelHeader?: boolean
}) {
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const addTextLayer = useEditorStore(s => s.addTextLayer)

  return (
    <StudioTextAddPanel
      embedded={embedded}
      showPanelHeader={showPanelHeader}
      emptyState={
        !activeSlideId ? (
          <StudioTextNoTargetEmpty
            title="No slide selected"
            description="Select a slide on the canvas to add text."
          />
        ) : undefined
      }
      onAddStyle={style => {
        if (!activeSlideId) return
        addTextLayer(activeSlideId, style)
      }}
    />
  )
}
