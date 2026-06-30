'use client'

import { useCallback } from 'react'
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { move } from '@dnd-kit/helpers'
import type { LayerId, SlideId, TextLayer } from '@socialista/types'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  GripVerticalIcon,
  PencilIcon,
  Trash2Icon,
  TypeIcon,
} from 'lucide-react'
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

type LayerListProps = {
  /** Show empty state instead of hiding when there are no layers. */
  forceVisible?: boolean
}

export function LayerList({ forceVisible = false }: LayerListProps) {
  const slide = useEditorStore(s => s.slides.find(sl => sl.id === s.activeSlideId) ?? null)
  const setLayerOrder = useEditorStore(s => s.setLayerOrder)

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.canceled) return
      const { slides, activeSlideId } = useEditorStore.getState()
      const currentSlide = slides.find(s => s.id === activeSlideId)
      if (!currentSlide) return
      const ids = sortLayers(currentSlide.layers)
        .slice()
        .reverse()
        .map(layer => layer.id)
      const reordered = move(ids, event) as LayerId[]
      if (reordered.every((id, i) => id === ids[i])) return
      setLayerOrder(currentSlide.id, reordered)
    },
    [setLayerOrder],
  )

  if (!slide) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/20 px-3 py-6 text-center text-xs text-muted-foreground">
        Select a slide to view its layers.
      </div>
    )
  }

  if (slide.layers.length === 0) {
    if (!forceVisible) return null
    return <LayerListEmpty slideId={slide.id} />
  }

  const layers = sortLayers(slide.layers).slice().reverse()

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <div className="flex flex-col gap-1">
        <p className="px-1 text-[10px] leading-relaxed text-muted-foreground">
          Drag to reorder · Top = front · Right-click for more
        </p>
        {layers.map((layer, index) => (
          <SortableLayerRow key={layer.id} slideId={slide.id} layer={layer} index={index} />
        ))}
      </div>
    </DragDropProvider>
  )
}

function LayerListEmpty({ slideId }: { slideId: SlideId }) {
  const addTextLayer = useEditorStore(s => s.addTextLayer)

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-muted/20 px-3 py-6 text-center">
      <p className="text-xs text-muted-foreground">No text layers on this slide yet.</p>
      <button
        type="button"
        onClick={() => addTextLayer(slideId)}
        className="text-xs font-medium text-primary underline-offset-4 hover:underline"
      >
        Add text layer
      </button>
    </div>
  )
}

function SortableLayerRow({
  slideId,
  layer,
  index,
}: {
  slideId: SlideId
  layer: TextLayer
  index: number
}) {
  const activeLayerId = useEditorStore(s => s.activeLayerId)
  const setActiveLayer = useEditorStore(s => s.setActiveLayer)
  const duplicateLayer = useEditorStore(s => s.duplicateLayer)
  const removeLayer = useEditorStore(s => s.removeLayer)
  const bringForward = useEditorStore(s => s.bringForward)
  const sendBackward = useEditorStore(s => s.sendBackward)

  const { ref, handleRef, isDragging, isDropTarget } = useSortable({
    id: layer.id,
    index,
  })

  const active = layer.id === activeLayerId

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          ref={ref}
          className={cn(
            'flex items-center gap-1 rounded-md border transition-[opacity,box-shadow,background-color,border-color]',
            active
              ? 'border-primary/30 bg-primary/10 text-foreground'
              : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted/60',
            isDragging && 'z-10 opacity-60 shadow-md',
            isDropTarget && !isDragging && 'border-primary/40 ring-2 ring-primary/15',
          )}
        >
          <button
            ref={handleRef}
            type="button"
            className="flex shrink-0 cursor-grab touch-none items-center px-1.5 py-2 text-muted-foreground/70 hover:text-muted-foreground active:cursor-grabbing"
            aria-label={`Drag to reorder ${layer.content || 'text layer'}`}
          >
            <GripVerticalIcon className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setActiveLayer(slideId, layer.id)}
            className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-2 text-left text-xs outline-none"
          >
            <TypeIcon className="size-3.5 shrink-0" />
            <span className="truncate">{layer.content || 'Empty text'}</span>
          </button>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => setActiveLayer(slideId, layer.id)}>
          <PencilIcon /> Select
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => bringForward(slideId, layer.id)}>
          <ArrowUpIcon /> Bring forward
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => sendBackward(slideId, layer.id)}>
          <ArrowDownIcon /> Send backward
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onSelect={() => duplicateLayer(slideId, layer.id)}>
          <CopyIcon /> Duplicate layer
        </ContextMenuItem>
        <ContextMenuItem variant="destructive" onSelect={() => removeLayer(slideId, layer.id)}>
          <Trash2Icon /> Delete layer
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
