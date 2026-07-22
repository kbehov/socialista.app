'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { DragDropProvider, type DragEndEvent } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { move } from '@dnd-kit/helpers'
import type { LayerId, SlideId, SlideLayer } from '@socialista/types'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  FolderOpenIcon,
  GripVerticalIcon,
  ImageIcon,
  PencilIcon,
  SparklesIcon,
  Trash2Icon,
  TypeIcon,
  UploadIcon,
} from 'lucide-react'
import { useEditorStore } from '@/lib/carousel/store'
import { sortLayers } from '@/lib/carousel/defaults'
import { overlayFillColor } from '@/lib/carousel/overlay-style'
import { useSlideImageEditOptional } from '@/components/carousel/slide-image-edit-provider'
import { WorkspaceImagePickerDialog } from '@/components/carousel/workspace-image-picker-dialog'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const LayerListDragContext = createContext<React.MutableRefObject<boolean> | null>(null)

function useSuppressLayerSelectAfterDrag() {
  const ref = useContext(LayerListDragContext)
  if (!ref) {
    throw new Error('useSuppressLayerSelectAfterDrag must be used within LayerList')
  }
  return ref
}

type LayerListProps = {
  /** Show empty state instead of hiding when there are no layers. */
  forceVisible?: boolean
}

export function LayerList({ forceVisible = false }: LayerListProps) {
  const slide = useEditorStore(s => s.slides.find(sl => sl.id === s.activeSlideId) ?? null)
  const setLayerOrder = useEditorStore(s => s.setLayerOrder)
  const suppressSelectRef = useRef(false)

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.canceled) {
        suppressSelectRef.current = false
        return
      }
      const { slides, activeSlideId } = useEditorStore.getState()
      const currentSlide = slides.find(s => s.id === activeSlideId)
      if (!currentSlide) return
      const ids = sortLayers(currentSlide.layers)
        .slice()
        .reverse()
        .map(layer => layer.id)
      const reordered = move(ids, event) as LayerId[]
      if (reordered.every((id, i) => id === ids[i])) return

      const slideId = currentSlide.id
      suppressSelectRef.current = true
      window.setTimeout(() => {
        suppressSelectRef.current = false
      }, 250)

      // Defer until after dnd-kit finishes its insertion-effect cleanup (React 19).
      window.setTimeout(() => {
        setLayerOrder(slideId, reordered)
      }, 0)
    },
    [setLayerOrder],
  )

  const handleDragStart = useCallback(() => {
    suppressSelectRef.current = true
  }, [])

  if (!slide) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 bg-muted/10 px-3 py-6 text-center text-xs text-muted-foreground">
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
    <LayerListDragContext.Provider value={suppressSelectRef}>
      <DragDropProvider onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-1">
          <LayerListActions slideId={slide.id} />
          <p className="px-1 text-[10px] leading-relaxed text-muted-foreground">
            Drag the grip to reorder · Top = front · Click row to select
          </p>
          {layers.map((layer, index) => (
            <SortableLayerRow key={layer.id} slideId={slide.id} layer={layer} index={index} />
          ))}
        </div>
      </DragDropProvider>
    </LayerListDragContext.Provider>
  )
}

function LayerListActions({ slideId }: { slideId: SlideId }) {
  const addTextLayer = useEditorStore(s => s.addTextLayer)
  const addImageLayer = useEditorStore(s => s.addImageLayer)
  const [filesDialogOpen, setFilesDialogOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    addImageLayer(slideId, URL.createObjectURL(file))
  }

  return (
    <>
      <div className="flex gap-1">
        <Button size="sm" variant="outline" className="h-7 flex-1 text-xs" onClick={() => addTextLayer(slideId)}>
          <TypeIcon className="size-3" />
          Text
        </Button>
        <Button size="sm" variant="outline" className="h-7 flex-1 text-xs" onClick={() => fileInputRef.current?.click()}>
          <UploadIcon className="size-3" />
          Image
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-7 flex-1 text-xs"
          onClick={() => setFilesDialogOpen(true)}
        >
          <FolderOpenIcon className="size-3" />
          Files
        </Button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
      <WorkspaceImagePickerDialog
        open={filesDialogOpen}
        onOpenChange={setFilesDialogOpen}
        onSelect={url => addImageLayer(slideId, url)}
      />
    </>
  )
}

function LayerListEmpty({ slideId }: { slideId: SlideId }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border/50 bg-muted/10 px-3 py-6 text-center">
      <p className="text-xs text-muted-foreground">No layers on this slide yet.</p>
      <LayerListActions slideId={slideId} />
    </div>
  )
}

function SortableLayerRow({
  slideId,
  layer,
  index,
}: {
  slideId: SlideId
  layer: SlideLayer
  index: number
}) {
  const suppressSelectRef = useSuppressLayerSelectAfterDrag()
  const activeLayerId = useEditorStore(s => s.activeLayerId)
  const setActiveLayer = useEditorStore(s => s.setActiveLayer)
  const duplicateLayer = useEditorStore(s => s.duplicateLayer)
  const removeLayer = useEditorStore(s => s.removeLayer)
  const bringForward = useEditorStore(s => s.bringForward)
  const sendBackward = useEditorStore(s => s.sendBackward)
  const promoteImageLayerToBackground = useEditorStore(s => s.promoteImageLayerToBackground)
  const imageEdit = useSlideImageEditOptional()
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)

  const { ref, handleRef, isDragging, isDropTarget } = useSortable({
    id: layer.id,
    index,
  })

  const active = layer.id === activeLayerId
  const label =
    layer.type === 'text'
      ? layer.content || 'Empty text'
      : layer.type === 'overlay'
        ? 'Overlay'
        : 'Image layer'

  const handleSelect = () => {
    if (suppressSelectRef.current || isDragging) return
    setActiveLayer(slideId, layer.id)
  }

  const handleLabelPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    pointerStartRef.current = { x: event.clientX, y: event.clientY }
  }

  const handleLabelClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (suppressSelectRef.current || isDragging) {
      event.preventDefault()
      return
    }

    const start = pointerStartRef.current
    pointerStartRef.current = null
    if (start) {
      const dx = event.clientX - start.x
      const dy = event.clientY - start.y
      if (dx * dx + dy * dy > 36) {
        event.preventDefault()
        return
      }
    }

    handleSelect()
  }

  return (
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
        aria-label={`Drag to reorder ${label}`}
        onClick={event => event.preventDefault()}
      >
        <GripVerticalIcon className="size-3.5" />
      </button>

      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            type="button"
            onPointerDown={handleLabelPointerDown}
            onClick={handleLabelClick}
            className="flex min-w-0 flex-1 items-center gap-2 py-2 pr-2 text-left text-xs outline-none"
          >
            {layer.type === 'text' ? (
              <TypeIcon className="size-3.5 shrink-0" />
            ) : layer.type === 'overlay' ? (
              <div
                className="size-5 shrink-0 rounded border"
                style={{ backgroundColor: overlayFillColor(layer.color, layer.opacity) }}
              />
            ) : layer.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={layer.imageUrl} alt="" className="size-5 shrink-0 rounded object-cover" />
            ) : (
              <ImageIcon className="size-3.5 shrink-0" />
            )}
            <span className="truncate">{label}</span>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent>
        <ContextMenuItem onSelect={() => setActiveLayer(slideId, layer.id)}>
          <PencilIcon /> Select
        </ContextMenuItem>
        {layer.type === 'image' ? (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              disabled={!layer.imageUrl}
              onSelect={() =>
                imageEdit?.openEditDialog({
                  kind: 'layer',
                  slideId,
                  layerId: layer.id,
                  imageUrl: layer.imageUrl,
                })
              }
            >
              <SparklesIcon /> Edit with AI
            </ContextMenuItem>
            <ContextMenuItem
              disabled={!layer.imageUrl}
              onSelect={() => promoteImageLayerToBackground(slideId, layer.id)}
            >
              <ImageIcon /> Set as background
            </ContextMenuItem>
          </>
        ) : null}
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
    </div>
  )
}
