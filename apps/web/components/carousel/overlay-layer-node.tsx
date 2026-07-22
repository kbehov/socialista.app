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
import { overlayFillColor } from '@/lib/carousel/overlay-style'
import { useEditorStore } from '@/lib/carousel/store'
import { cn } from '@/lib/utils'
import type { OverlayLayer, SlideId } from '@socialista/types'
import { ArrowDownIcon, ArrowUpIcon, CopyIcon, Trash2Icon } from 'lucide-react'
import type { RefObject } from 'react'
import { useMemo, useRef } from 'react'

type OverlayLayerNodeProps = {
  layer: OverlayLayer
  slideId: SlideId
  scale: number
  canvasRef: RefObject<HTMLDivElement | null>
  selected: boolean
  interactive: boolean
  selectable?: boolean
}

export function OverlayLayerNode({
  layer,
  slideId,
  scale,
  canvasRef,
  selected,
  interactive,
  selectable = interactive,
}: OverlayLayerNodeProps) {
  const updateLayer = useEditorStore(s => s.updateLayer)
  const setActiveLayer = useEditorStore(s => s.setActiveLayer)
  const duplicateLayer = useEditorStore(s => s.duplicateLayer)
  const removeLayer = useEditorStore(s => s.removeLayer)
  const bringForward = useEditorStore(s => s.bringForward)
  const sendBackward = useEditorStore(s => s.sendBackward)
  const imageEdit = useSlideImageEditOptional()
  const layerRef = useRef<HTMLDivElement>(null)

  const { draft, beginDrag, beginResize, beginRotate } = useDragResize({
    layer,
    canvasRef,
    layerRef,
    onCommit: partial => updateLayer(slideId, layer.id, partial),
  })

  const effective = useMemo(() => (draft ? { ...layer, ...draft } : layer), [layer, draft])
  const fillColor = useMemo(
    () => overlayFillColor(effective.color, effective.opacity),
    [effective.color, effective.opacity],
  )
  const borderRadiusPx = (effective.borderRadius ?? 0) * scale

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
      }}
      onPointerDown={canSelect || canDrag ? handlePointerDown : undefined}
    >
      <div
        className="pointer-events-none size-full"
        style={{
          backgroundColor: fillColor,
          borderRadius: borderRadiusPx,
        }}
      />

      {selected && interactive ? (
        <LayerTransformHandles onResize={beginResize} onRotate={beginRotate} />
      ) : null}
    </div>
  )

  if (!selectable && !interactive) return layerEl

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{layerEl}</ContextMenuTrigger>
      <ContextMenuContent>
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
