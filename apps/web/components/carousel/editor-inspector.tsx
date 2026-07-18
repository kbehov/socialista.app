'use client'

import {
  StudioPanelHeader,
  StudioPanelScrollArea,
  StudioSegmentedTabs,
} from '@/components/carousel/studio-segmented-tabs'
import { Button } from '@/components/ui/button'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import { ImageIcon, LayersIcon, TypeIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ImageLayerToolbar } from './image-layer-toolbar'
import { LayerList } from './layer-list'
import { SlideBackgroundPanel } from './slide-background-panel'
import { TextToolbar } from './text-toolbar'

type InspectorTab = 'slide' | 'text' | 'image' | 'layers'

export type { InspectorTab }

const PRIMARY_TABS = [
  { id: 'slide' as const, label: 'Slide', icon: ImageIcon },
  { id: 'text' as const, label: 'Text', icon: TypeIcon },
  { id: 'image' as const, label: 'Image', icon: ImageIcon },
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
  const visibleTabs = useMemo(() => PRIMARY_TABS, [])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="shrink-0 space-y-2.5 border-b border-border/60 px-3 py-2.5">
        {panelHeaderVisible ? (
          <StudioPanelHeader title="Edit" description="Background, layers, text, and images" />
        ) : null}
        <div className="flex items-center gap-1">
          <StudioSegmentedTabs
            tabs={visibleTabs}
            value={tab === 'layers' ? null : (tab as 'slide' | 'text' | 'image')}
            onChange={next => onTabChange(next)}
            size="xs"
            className="min-w-0 flex-1"
            ariaLabel="Edit sections"
          />
          <Button
            type="button"
            size="icon-sm"
            variant={tab === 'layers' ? 'secondary' : 'ghost'}
            className={cn('size-8 shrink-0', tab === 'layers' && 'shadow-sm')}
            aria-label="Layers"
            aria-pressed={tab === 'layers'}
            onClick={() => onTabChange('layers')}
          >
            <LayersIcon className="size-3.5" />
          </Button>
        </div>
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
