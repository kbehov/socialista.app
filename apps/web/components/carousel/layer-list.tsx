'use client'

import { CopyIcon, PencilIcon, Trash2Icon, TypeIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react'
import { useEditorStore } from '@/lib/carousel/store'
import { sortLayers } from '@/lib/carousel/defaults'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'

export function LayerList() {
  const slide = useEditorStore(s => s.slides.find(sl => sl.id === s.activeSlideId) ?? null)
  const activeLayerId = useEditorStore(s => s.activeLayerId)
  const setActiveLayer = useEditorStore(s => s.setActiveLayer)
  const duplicateLayer = useEditorStore(s => s.duplicateLayer)
  const removeLayer = useEditorStore(s => s.removeLayer)
  const bringForward = useEditorStore(s => s.bringForward)
  const sendBackward = useEditorStore(s => s.sendBackward)

  if (!slide || slide.layers.length === 0) return null

  // Display top of stack first.
  const layers = sortLayers(slide.layers).slice().reverse()

  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-card p-2 shadow-xs">
      <span className="px-1 text-[11px] font-medium text-muted-foreground">Layers</span>
      {layers.map(layer => {
        const active = layer.id === activeLayerId
        return (
          <ContextMenu key={layer.id}>
            <ContextMenuTrigger asChild>
              <button
                type="button"
                onClick={() => setActiveLayer(slide.id, layer.id)}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs outline-none transition',
                  active ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <TypeIcon className="size-3.5 shrink-0" />
                <span className="flex-1 truncate">{layer.content || 'Empty text'}</span>
              </button>
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onSelect={() => setActiveLayer(slide.id, layer.id)}>
                <PencilIcon /> Select
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={() => bringForward(slide.id, layer.id)}>
                <ArrowUpIcon /> Bring forward
              </ContextMenuItem>
              <ContextMenuItem onSelect={() => sendBackward(slide.id, layer.id)}>
                <ArrowDownIcon /> Send backward
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem onSelect={() => duplicateLayer(slide.id, layer.id)}>
                <CopyIcon /> Duplicate layer
              </ContextMenuItem>
              <ContextMenuItem variant="destructive" onSelect={() => removeLayer(slide.id, layer.id)}>
                <Trash2Icon /> Delete layer
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        )
      })}
    </div>
  )
}
