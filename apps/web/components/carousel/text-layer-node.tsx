'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { ArrowDownIcon, ArrowUpIcon, AlignVerticalJustifyCenterIcon, AlignVerticalJustifyEndIcon, AlignVerticalJustifyStartIcon, CopyIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import type { SlideId, TextLayer } from '@socialista/types'
import { useEditorStore } from '@/lib/carousel/store'
import { useSlideImageEditOptional } from '@/components/carousel/slide-image-edit-provider'
import { useDragResize } from '@/hooks/carousel/use-drag-resize'
import { LayerTransformHandles } from '@/components/carousel/layer-transform-handles'
import { buildTextLayerCss } from '@/lib/carousel/text-style'
import { clamp } from '@/lib/carousel/defaults'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const CANVAS_EDGE_MARGIN = 8

type VerticalAlign = 'top' | 'center' | 'bottom'

function getAlignedPosition(layer: Pick<TextLayer, 'width' | 'height'>, alignment: VerticalAlign) {
  const x = clamp((100 - layer.width) / 2, -10, 100 - layer.width)
  const y =
    alignment === 'top'
      ? clamp(CANVAS_EDGE_MARGIN, -10, 100 - layer.height)
      : alignment === 'center'
        ? clamp((100 - layer.height) / 2, -10, 100 - layer.height)
        : clamp(100 - layer.height - CANVAS_EDGE_MARGIN, -10, 100 - layer.height)

  return { x, y }
}

type TextLayerNodeProps = {
  layer: TextLayer
  slideId: SlideId
  scale: number
  selected: boolean
  canvasRef: RefObject<HTMLDivElement | null>
  interactive: boolean
  selectable?: boolean
}

export function TextLayerNode({
  layer,
  slideId,
  scale,
  selected,
  canvasRef,
  interactive,
  selectable = interactive,
}: TextLayerNodeProps) {
  const updateLayer = useEditorStore(s => s.updateLayer)
  const setActiveLayer = useEditorStore(s => s.setActiveLayer)
  const deselectBackgroundEdit = useSlideImageEditOptional()?.deselectBackgroundEdit
  const duplicateLayer = useEditorStore(s => s.duplicateLayer)
  const removeLayer = useEditorStore(s => s.removeLayer)
  const bringForward = useEditorStore(s => s.bringForward)
  const sendBackward = useEditorStore(s => s.sendBackward)
  const [isEditing, setIsEditing] = useState(false)
  const editRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)

  const { draft, beginDrag, beginResize, beginRotate } = useDragResize({
    layer,
    canvasRef,
    layerRef,
    onCommit: partial => updateLayer(slideId, layer.id, partial),
  })

  const effective = useMemo(() => (draft ? { ...layer, ...draft } : layer), [layer, draft])

  const textCss = useMemo(() => buildTextLayerCss(effective.style, scale), [effective.style, scale])

  useEffect(() => {
    if (!isEditing || !editRef.current) return

    editRef.current.innerText = layer.content || ''
    editRef.current.focus({ preventScroll: true })

    const range = document.createRange()
    range.selectNodeContents(editRef.current)
    range.collapse(false)

    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }, [isEditing, layer.id])

  const commitEdit = () => {
    if (!editRef.current) return
    const next = editRef.current.innerText.replace(/\r\n/g, '\n').trim()
    const canvasEl = canvasRef.current
    const partial: Partial<TextLayer> = {}

    if (next !== layer.content.trim()) {
      partial.content = next || ' '
    }

    if (canvasEl && editRef.current.scrollHeight > 0) {
      const canvasHeight = canvasEl.clientHeight
      if (canvasHeight > 0) {
        const neededPct = (editRef.current.scrollHeight / canvasHeight) * 100
        const minHeight = Math.max(layer.height, neededPct)
        if (minHeight > layer.height + 0.5) {
          partial.height = Math.min(minHeight, 100)
        }
      }
    }

    if (Object.keys(partial).length > 0) {
      updateLayer(slideId, layer.id, partial)
    }

    setIsEditing(false)
  }

  const growToFitContent = () => {
    if (!isEditing || !editRef.current || !canvasRef.current) return
    const canvasHeight = canvasRef.current.clientHeight
    if (canvasHeight <= 0) return

    const neededPct = (editRef.current.scrollHeight / canvasHeight) * 100
    const currentHeight = draft?.height ?? layer.height
    if (neededPct > currentHeight + 0.5) {
      updateLayer(slideId, layer.id, { height: Math.min(neededPct, 100) })
    }
  }

  const alignLayer = (alignment: VerticalAlign) => {
    const { width, height } = effective
    updateLayer(slideId, layer.id, getAlignedPosition({ width, height }, alignment))
  }

  const canDrag = interactive && !isEditing
  const canSelect = selectable && !isEditing

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canSelect && !canDrag) return
    if (canSelect) {
      e.stopPropagation()
      deselectBackgroundEdit?.()
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
        selected && interactive && !isEditing && 'overflow-visible',
        !selectable && !interactive && 'pointer-events-none',
        canDrag && 'cursor-move',
        canSelect && !canDrag && 'cursor-pointer',
        isEditing && 'cursor-text',
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
      onDoubleClick={interactive && canSelect ? () => setIsEditing(true) : undefined}
    >
      <div
        ref={editRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={commitEdit}
        onInput={isEditing ? growToFitContent : undefined}
        onKeyDown={
          isEditing
            ? e => {
                e.stopPropagation()
                if (e.key === 'Escape') {
                  e.preventDefault()
                  commitEdit()
                }
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  commitEdit()
                }
              }
            : undefined
        }
        className={cn(
          'block h-full w-full break-words whitespace-pre-wrap',
          isEditing
            ? 'cursor-text overflow-y-auto outline-none ring-2 ring-primary/60'
            : 'overflow-hidden',
        )}
        style={textCss}
      >
        {isEditing ? null : layer.content || ' '}
      </div>

      {selected && interactive && !isEditing ? (
        <LayerTransformHandles
          onResize={beginResize}
          onRotate={beginRotate}
          toolbar={<TextLayerAlignToolbar onAlign={alignLayer} />}
        />
      ) : null}
    </div>
  )

  if ((!selectable && !interactive) || isEditing) return layerEl

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{layerEl}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onSelect={() => setIsEditing(true)}>
          <PencilIcon /> Edit text
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

function TextLayerAlignToolbar({ onAlign }: { onAlign: (alignment: VerticalAlign) => void }) {
  return (
    <div
      className="pointer-events-none absolute top-[calc(100%+10px)] left-1/2 z-50 -translate-x-1/2"
      onPointerDown={event => event.stopPropagation()}
    >
      <div className="pointer-events-auto flex items-center gap-0.5 rounded-full border bg-background/95 p-0.5 shadow-lg backdrop-blur-sm">
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          className="rounded-full"
          aria-label="Align top center"
          onClick={() => onAlign('top')}
        >
          <AlignVerticalJustifyStartIcon />
        </Button>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          className="rounded-full"
          aria-label="Align center"
          onClick={() => onAlign('center')}
        >
          <AlignVerticalJustifyCenterIcon />
        </Button>
        <Button
          type="button"
          size="icon-xs"
          variant="ghost"
          className="rounded-full"
          aria-label="Align bottom center"
          onClick={() => onAlign('bottom')}
        >
          <AlignVerticalJustifyEndIcon />
        </Button>
      </div>
    </div>
  )
}
