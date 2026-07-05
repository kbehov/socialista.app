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

const TABS: { id: InspectorTab; label: string; icon: typeof TypeIcon }[] = [
  { id: 'slide', label: 'Slide', icon: ImageIcon },
  { id: 'text', label: 'Text', icon: TypeIcon },
  { id: 'layers', label: 'Layers', icon: LayersIcon },
]

export function EditorInspector() {
  const activeLayerId = useEditorStore(s => s.activeLayerId)
  const [tab, setTab] = useState<InspectorTab>('slide')

  useEffect(() => {
    if (activeLayerId) setTab('text')
  }, [activeLayerId])

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b bg-muted/15 px-2.5 py-2">
        <div className="flex gap-0.5 rounded-lg border border-border/50 bg-muted/40 p-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setTab(id)}
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
