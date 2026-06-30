'use client'

import { useEffect, useState } from 'react'
import { ImageIcon, LayersIcon, TypeIcon } from 'lucide-react'
import { useEditorStore } from '@/lib/carousel/store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
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
      <div className="shrink-0 border-b bg-muted/30 px-2 py-2">
        <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Inspector
        </p>
        <div className="flex gap-0.5 rounded-lg bg-muted/60 p-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setTab(id)}
              className={cn(
                'h-8 flex-1 gap-1.5 rounded-md px-2 text-xs font-medium',
                tab === id
                  ? 'bg-background text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground',
              )}
              aria-pressed={tab === id}
            >
              <Icon className="size-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full **:data-[slot=scroll-area-viewport]:size-full">
          <div className="flex flex-col gap-3 p-3">
            {tab === 'slide' ? <SlideBackgroundPanel /> : null}
            {tab === 'text' ? <TextToolbar /> : null}
            {tab === 'layers' ? <LayerList forceVisible /> : null}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
