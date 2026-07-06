'use client'

import { useEffect, useState } from 'react'
import { ImageIcon, LayersIcon, TypeIcon } from 'lucide-react'
import { useEditorStore } from '@/lib/carousel/store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LayerList } from './layer-list'
import { SlideBackgroundPanel } from './slide-background-panel'
import { TextToolbar } from './text-toolbar'

type InspectorTab = 'slide' | 'text' | 'layers'

export type { InspectorTab }

const TABS: { id: InspectorTab; label: string; icon: typeof TypeIcon }[] = [
  { id: 'slide', label: 'Slide', icon: ImageIcon },
  { id: 'text', label: 'Text', icon: TypeIcon },
  { id: 'layers', label: 'Layers', icon: LayersIcon },
]

function InspectorTabBar({
  tab,
  onTabChange,
  embedded,
}: {
  tab: InspectorTab
  onTabChange: (tab: InspectorTab) => void
  embedded: boolean
}) {
  if (embedded) {
    return (
      <div className="shrink-0 space-y-2 border-b px-3 py-2.5">
        <div>
          <p className="text-xs font-semibold tracking-tight">Edit</p>
          <p className="text-[11px] text-muted-foreground">Background, text, and layer order</p>
        </div>
        <div className="flex gap-0.5 rounded-md border border-border/50 bg-muted/30 p-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onTabChange(id)}
              className={cn(
                'h-7 flex-1 gap-1 rounded-sm px-1.5 text-[11px] font-medium',
                tab === id
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
              )}
              aria-pressed={tab === id}
            >
              <Icon className="size-3 shrink-0" />
              <span className="truncate">{label}</span>
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="shrink-0 border-b bg-muted/15 px-2.5 py-2">
      <div className="flex gap-0.5 rounded-lg border border-border/50 bg-muted/40 p-0.5">
        {TABS.map(({ id, label, icon: Icon }) => (
          <Button
            key={id}
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onTabChange(id)}
            className={cn(
              'h-7 flex-1 gap-1.5 rounded-md px-2 text-xs font-medium',
              tab === id
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:bg-background/50 hover:text-foreground',
            )}
            aria-pressed={tab === id}
          >
            <Icon className="size-3.5 shrink-0" />
            <span className="truncate">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}

export function EditorInspector({
  tab: controlledTab,
  onTabChange: onTabChangeProp,
  embedded = false,
}: {
  tab?: InspectorTab
  onTabChange?: (tab: InspectorTab) => void
  embedded?: boolean
}) {
  const [internalTab, setInternalTab] = useState<InspectorTab>('slide')
  const tab = controlledTab ?? internalTab
  const onTabChange = onTabChangeProp ?? setInternalTab
  const activeLayerId = useEditorStore(s => s.activeLayerId)

  useEffect(() => {
    if (activeLayerId) onTabChange('text')
  }, [activeLayerId, onTabChange])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <InspectorTabBar tab={tab} onTabChange={onTabChange} embedded={embedded} />

      <div className="min-h-0 flex-1 overflow-y-auto sidebar-scrollbar">
        <div className="flex flex-col gap-2.5 p-3">
          {tab === 'slide' ? <SlideBackgroundPanel /> : null}
          {tab === 'text' ? <TextToolbar /> : null}
          {tab === 'layers' ? <LayerList forceVisible /> : null}
        </div>
      </div>
    </div>
  )
}
