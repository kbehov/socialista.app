'use client'

import {
  StudioPanelHeader,
  StudioPanelScrollArea,
  StudioSegmentedTabs,
} from '@/components/carousel/studio-segmented-tabs'
import { useEditorStore } from '@/lib/carousel/store'
import { ImageIcon, LayersIcon, TypeIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ImageLayerToolbar } from './image-layer-toolbar'
import { LayerList } from './layer-list'
import { SlideBackgroundPanel } from './slide-background-panel'
import { TextToolbar } from './text-toolbar'

type InspectorTab = 'slide' | 'text' | 'image' | 'layers'

export type { InspectorTab }

const TABS = [
  { id: 'slide' as const, label: 'Slide', icon: ImageIcon },
  { id: 'text' as const, label: 'Text', icon: TypeIcon },
  { id: 'image' as const, label: 'Image', icon: ImageIcon },
  { id: 'layers' as const, label: 'Layers', icon: LayersIcon },
]

export function EditorInspector({
  tab: controlledTab,
  onTabChange: onTabChangeProp,
  embedded = false,
  showPanelHeader,
}: {
  tab?: InspectorTab
  onTabChange?: (tab: InspectorTab) => void
  embedded?: boolean
  showPanelHeader?: boolean
}) {
  const [internalTab, setInternalTab] = useState<InspectorTab>('slide')
  const tab = controlledTab ?? internalTab
  const onTabChange = onTabChangeProp ?? setInternalTab
  const activeLayerId = useEditorStore(s => s.activeLayerId)
  const activeLayerType = useEditorStore(s => {
    const slide = s.slides.find(sl => sl.id === s.activeSlideId)
    return slide?.layers.find(l => l.id === s.activeLayerId)?.type ?? null
  })

  const prevActiveLayerIdRef = useRef(activeLayerId)

  useEffect(() => {
    if (prevActiveLayerIdRef.current === activeLayerId) return
    prevActiveLayerIdRef.current = activeLayerId

    if (!activeLayerId || !activeLayerType) return
    if (tab === 'layers') return
    onTabChange(activeLayerType === 'image' ? 'image' : 'text')
  }, [activeLayerId, activeLayerType, onTabChange, tab])

  const panelHeaderVisible = showPanelHeader ?? embedded

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="shrink-0 space-y-2.5 border-b border-border/60 px-3 py-2.5">
        {panelHeaderVisible ? (
          <StudioPanelHeader title="Edit" description="Background, layers, text, and images" />
        ) : null}
        <StudioSegmentedTabs tabs={TABS} value={tab} onChange={onTabChange} size="xs" />
      </div>

      <StudioPanelScrollArea>
        {tab === 'slide' ? <SlideBackgroundPanel /> : null}
        {tab === 'text' ? <TextToolbar /> : null}
        {tab === 'image' ? <ImageLayerToolbar /> : null}
        {tab === 'layers' ? <LayerList forceVisible /> : null}
      </StudioPanelScrollArea>
    </div>
  )
}
