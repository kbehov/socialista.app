'use client'

import { LayerTransformHandles } from '@/components/carousel/layer-transform-handles'
import { useSlideImageEditOptional } from '@/components/carousel/slide-image-edit-provider'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { useDragResize } from '@/hooks/carousel/use-drag-resize'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import { filtersToCss } from '@/utils/media-filters'
import type { ImageLayer, SlideId } from '@socialista/types'
import { ArrowDownIcon, ArrowUpIcon, CopyIcon, ImageIcon, SparklesIcon, Trash2Icon, UploadIcon } from 'lucide-react'
import type { RefObject } from 'react'
import { useMemo, useRef } from 'react'

type ImageLayerNodeProps = {
  layer: ImageLayer
  slideId: SlideId
  canvasRef: RefObject<HTMLDivElement | null>
  selected: boolean
  interactive: boolean
  selectable?: boolean
}

export function ImageLayerNode({
  layer,
  slideId,
  canvasRef,
  selected,
  interactive,
  selectable = interactive,
}: ImageLayerNodeProps) {
  const updateLayer = useEditorStore(s => s.updateLayer)
  const setActiveLayer = useEditorStore(s => s.setActiveLayer)
  const duplicateLayer = useEditorStore(s => s.duplicateLayer)
  const removeLayer = useEditorStore(s => s.removeLayer)
  const bringForward = useEditorStore(s => s.bringForward)
  const sendBackward = useEditorStore(s => s.sendBackward)
  const promoteImageLayerToBackground = useEditorStore(s => s.promoteImageLayerToBackground)
  const imageEdit = useSlideImageEditOptional()
  const layerRef = useRef<HTMLDivElement>(null)

  const { draft, beginDrag, beginResize, beginRotate } = useDragResize({
    layer,
    canvasRef,
    layerRef,
    onCommit: partial => updateLayer(slideId, layer.id, partial),
  })

  const effective = useMemo(() => (draft ? { ...layer, ...draft } : layer), [layer, draft])
  const filterStyle = useMemo(() => filtersToCss(effective.filters), [effective.filters])

  const editTarget = useMemo(
    () => ({ kind: 'layer' as const, slideId, layerId: layer.id, imageUrl: layer.imageUrl }),
    [slideId, layer.id, layer.imageUrl],
  )

  const canDrag = interactive
  const canSelect = selectable

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canSelect && !canDrag) return
    if (canSelect) {
      e.stopPropagation()
      imageEdit?.deselectBackgroundEdit()
      setActiveLayer(slideId, layer.id)
    }
    if (canDrag) {
      beginDrag(e)
    }
  }

  const layerEl = (
    <div
      ref={layerRef}
      data-layer-root
      className={cn(
        'absolute select-none',
        selected && interactive && 'overflow-visible',
        !selectable && !interactive && 'pointer-events-none',
        canDrag && 'cursor-move',
        canSelect && !canDrag && 'cursor-pointer',
      )}
      style={{
        left: `${effective.x}%`,
        top: `${effective.y}%`,
        width: `${effective.width}%`,
        height: `${effective.height}%`,
        transform: `rotate(${effective.rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: effective.zIndex,
        opacity: effective.opacity,
      }}
      onPointerDown={canSelect || canDrag ? handlePointerDown : undefined}
    >
      {effective.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={effective.imageUrl}
          alt=""
          draggable={false}
          decoding="async"
          className="pointer-events-none size-full"
          style={{
            objectFit: effective.objectFit,
            filter: filterStyle || undefined,
          }}
        />
      ) : (
        <div className="flex size-full items-center justify-center rounded-sm border border-dashed border-muted-foreground/50 bg-muted/30">
          <ImageIcon className="size-6 text-muted-foreground/60" />
        </div>
      )}

      {selected && interactive ? <LayerTransformHandles onResize={beginResize} onRotate={beginRotate} /> : null}
    </div>
  )

  if (!selectable && !interactive) return layerEl

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{layerEl}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem disabled={!layer.imageUrl} onSelect={() => imageEdit?.openEditDialog(editTarget)}>
          <SparklesIcon /> Edit with AI
        </ContextMenuItem>
        <ContextMenuItem disabled={!layer.imageUrl} onSelect={() => promoteImageLayerToBackground(slideId, layer.id)}>
          <ImageIcon /> Set as background
        </ContextMenuItem>
        <ContextMenuItem onSelect={() => imageEdit?.replaceImage(editTarget)}>
          <UploadIcon /> Replace image
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
