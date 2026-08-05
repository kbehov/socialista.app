'use client'

import { StudioTextAddPanel, StudioTextPanelTip } from '@/components/editor/studio-text-add-panel'
import {
  DEFAULT_TEXT_LAYER_BASE,
  overlayStyleFromLayer,
} from '@/lib/video/defaults'
import { useVideoEditorStore } from '@/lib/video/store'
import type { TextLayerStyle } from '@socialista/types'
import { useCallback } from 'react'

function nextOverlayRange(): { start: number; end: number } {
  const { playhead, project } = useVideoEditorStore.getState()
  const duration = project.duration
  const end = Math.min(duration > 0 ? duration : playhead + 3, playhead + 3)
  return { start: playhead, end: Math.max(playhead + 0.5, end) }
}

export function VideoTextPanel({
  embedded = false,
  showPanelHeader,
}: {
  embedded?: boolean
  showPanelHeader?: boolean
}) {
  const addTextOverlay = useVideoEditorStore(s => s.addTextOverlay)

  const handleAddStyle = useCallback(
    (style: TextLayerStyle) => {
      const { start, end } = nextOverlayRange()
      addTextOverlay(start, end, overlayStyleFromLayer(style))
    },
    [addTextOverlay],
  )

  return (
    <StudioTextAddPanel
      embedded={embedded}
      showPanelHeader={showPanelHeader}
      baseStyle={DEFAULT_TEXT_LAYER_BASE}
      headerTitle="Text"
      headerDescription="Overlays land at the playhead"
      tip={
        <StudioTextPanelTip>
          Tip: drag overlays on the canvas or trim them on the timeline. Select one to refine style in
          the inspector.
        </StudioTextPanelTip>
      }
      onAddStyle={handleAddStyle}
    />
  )
}
