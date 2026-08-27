'use client'

import { ImageLayerToolbar } from '@/components/carousel/image-layer-toolbar'
import { OverlayLayerToolbar } from '@/components/carousel/overlay-layer-toolbar'
import { SlideBackgroundPanel } from '@/components/carousel/slide-background-panel'
import {
  StudioPanelHeader,
  StudioPanelScrollArea,
} from '@/components/carousel/studio-segmented-tabs'
import { TextToolbar } from '@/components/carousel/text-toolbar'
import { AlignmentToolbar, type AlignmentAction } from '@/components/editor/alignment-toolbar'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import { useCallback, useMemo } from 'react'

export function EditorInspector({
  embedded = false,
  showPanelHeader,
  className,
}: {
  embedded?: boolean
  showPanelHeader?: boolean
  className?: string
}) {
  const activeLayerType = useEditorStore(s => {
    const slide = s.slides.find(sl => sl.id === s.activeSlideId)
    return slide?.layers.find(l => l.id === s.activeLayerId)?.type ?? null
  })
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const activeLayerId = useEditorStore(s => s.activeLayerId)
  const showRulers = useEditorStore(s => s.showRulers)
  const showGuides = useEditorStore(s => s.showGuides)
  const snapEnabled = useEditorStore(s => s.snapEnabled)
  const toggleShowRulers = useEditorStore(s => s.toggleShowRulers)
  const toggleShowGuides = useEditorStore(s => s.toggleShowGuides)
  const toggleSnapEnabled = useEditorStore(s => s.toggleSnapEnabled)
  const alignLayerCenter = useEditorStore(s => s.alignLayerCenter)
  const alignLayerEdge = useEditorStore(s => s.alignLayerEdge)

  const panelHeaderVisible = showPanelHeader ?? embedded

  const handleAlign = useCallback(
    (action: AlignmentAction) => {
      if (!activeSlideId || !activeLayerId) return
      if (action.type === 'center') {
        alignLayerCenter(activeSlideId, activeLayerId, action.axis)
        return
      }
      if (action.type === 'edge') {
        alignLayerEdge(activeSlideId, activeLayerId, action.edge)
      }
    },
    [activeLayerId, activeSlideId, alignLayerCenter, alignLayerEdge],
  )

  const meta = useMemo(() => {
    if (activeLayerType === 'text') {
      return { title: 'Text', description: 'Style the selected text box' }
    }
    if (activeLayerType === 'image') {
      return { title: 'Image', description: 'Replace, filter, and transform' }
    }
    if (activeLayerType === 'overlay') {
      return { title: 'Overlay', description: 'Color, opacity, and coverage' }
    }
    return { title: 'Slide', description: 'Background color and photo' }
  }, [activeLayerType])

  return (
    <aside
      className={cn(
        'flex h-full min-h-0 min-w-0 flex-col overflow-hidden border-l border-border/40 bg-background',
        className,
      )}
      aria-label="Inspector"
    >
      <div className="shrink-0 border-b border-border/40 px-3.5 py-2.5">
        {panelHeaderVisible ? (
          <StudioPanelHeader title={meta.title} description={meta.description} />
        ) : (
          <p className="text-[13px] font-medium tracking-tight text-foreground">{meta.title}</p>
        )}
      </div>

      <StudioPanelScrollArea key={activeLayerType ?? 'slide'} contentClassName="animate-in fade-in-0 duration-150">
        {activeLayerId ? (
          <AlignmentToolbar
            onAlign={handleAlign}
            showDistribute={false}
            rulersVisible={showRulers}
            onToggleRulers={toggleShowRulers}
            guidesVisible={showGuides}
            onToggleGuides={toggleShowGuides}
            snapEnabled={snapEnabled}
            onToggleSnap={toggleSnapEnabled}
            size="xs"
            variant="inline"
          />
        ) : (
          <AlignmentToolbar
            showDistribute={false}
            rulersVisible={showRulers}
            onToggleRulers={toggleShowRulers}
            guidesVisible={showGuides}
            onToggleGuides={toggleShowGuides}
            snapEnabled={snapEnabled}
            onToggleSnap={toggleSnapEnabled}
            size="xs"
            variant="inline"
          />
        )}
        {activeLayerType === 'text' ? <TextToolbar /> : null}
        {activeLayerType === 'image' ? <ImageLayerToolbar /> : null}
        {activeLayerType === 'overlay' ? <OverlayLayerToolbar /> : null}
        {!activeLayerType ? <SlideBackgroundPanel /> : null}
      </StudioPanelScrollArea>
    </aside>
  )
}
