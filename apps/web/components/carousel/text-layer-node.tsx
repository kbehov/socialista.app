'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { ArrowDownIcon, ArrowUpIcon, CopyIcon, PencilIcon, Trash2Icon } from 'lucide-react'
import type { SlideId, TextLayer } from '@socialista/types'
import { useEditorStore } from '@/lib/carousel/store'
import { useDragResize, type Corner } from '@/hooks/carousel/use-drag-resize'
import { buildTextLayerCss } from '@/lib/carousel/text-style'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { cn } from '@/lib/utils'

type TextLayerNodeProps = {
  layer: TextLayer
  slideId: SlideId
  scale: number
  selected: boolean
  canvasRef: RefObject<HTMLDivElement | null>
  interactive: boolean
}

export function TextLayerNode({ layer, slideId, scale, selected, canvasRef, interactive }: TextLayerNodeProps) {
  const updateLayer = useEditorStore(s => s.updateLayer)
  const setActiveLayer = useEditorStore(s => s.setActiveLayer)
  const duplicateLayer = useEditorStore(s => s.duplicateLayer)
  const removeLayer = useEditorStore(s => s.removeLayer)
  const bringForward = useEditorStore(s => s.bringForward)
  const sendBackward = useEditorStore(s => s.sendBackward)
  const [isEditing, setIsEditing] = useState(false)
  const editRef = useRef<HTMLDivElement>(null)

  const { draft, beginDrag, beginResize, beginRotate } = useDragResize({
    layer,
    canvasRef,
    onCommit: partial => updateLayer(slideId, layer.id, partial),
  })

  const effective = useMemo(() => (draft ? { ...layer, ...draft } : layer), [layer, draft])

  const textCss = useMemo(() => buildTextLayerCss(effective.style, scale), [effective.style, scale])

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus()
      const range = document.createRange()
      range.selectNodeContents(editRef.current)
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }, [isEditing])

  const commitEdit = () => {
    if (!editRef.current) return
    const next = editRef.current.innerText.trim()
    if (next !== layer.content) {
      updateLayer(slideId, layer.id, { content: next || ' ' })
    }
    setIsEditing(false)
  }

  const layerEl = (
    <div
      className={cn('absolute select-none', interactive && 'cursor-move', isEditing && 'cursor-text')}
      style={{
        left: `${effective.x}%`,
        top: `${effective.y}%`,
        width: `${effective.width}%`,
        height: `${effective.height}%`,
        transform: `rotate(${effective.rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: effective.zIndex,
      }}
      onPointerDown={interactive && !isEditing ? beginDrag : undefined}
      onClick={
        interactive && !isEditing
          ? e => {
              e.stopPropagation()
              setActiveLayer(slideId, layer.id)
            }
          : undefined
      }
      onDoubleClick={interactive ? () => setIsEditing(true) : undefined}
    >
      <div
        ref={editRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onBlur={commitEdit}
        onKeyDown={
          isEditing
            ? e => {
                e.stopPropagation()
                if (e.key === 'Escape') {
                  e.preventDefault()
                  commitEdit()
                }
                if (e.key === 'Enter' && e.metaKey) {
                  e.preventDefault()
                  commitEdit()
                }
              }
            : undefined
        }
        className={cn(
          'flex h-full w-full items-center overflow-hidden whitespace-pre-wrap break-words',
          isEditing && 'outline-none ring-2 ring-primary/60',
        )}
        style={{
          ...textCss,
          justifyContent:
            effective.style.textAlign === 'center'
              ? 'center'
              : effective.style.textAlign === 'right'
                ? 'flex-end'
                : 'flex-start',
          wordBreak: 'break-word',
        }}
      >
        {layer.content || ' '}
      </div>

      {selected && interactive && !isEditing ? (
        <>
          <div className="pointer-events-none absolute inset-0 rounded-sm border border-dashed border-muted-foreground/70" />
          {(['nw', 'ne', 'se', 'sw'] as Corner[]).map(corner => (
            <Handle key={corner} corner={corner} onPointerDown={beginResize(corner)} />
          ))}
          <RotateHandle onPointerDown={beginRotate} />
        </>
      ) : null}
    </div>
  )

  if (!interactive || isEditing) return layerEl

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

type HandleProps = {
  corner: Corner
  onPointerDown: (e: React.PointerEvent) => void
}

const HANDLE_POSITION: Record<Corner, string> = {
  nw: '-left-1.5 -top-1.5 cursor-nwse-resize',
  ne: '-right-1.5 -top-1.5 cursor-nesw-resize',
  se: '-right-1.5 -bottom-1.5 cursor-nwse-resize',
  sw: '-left-1.5 -bottom-1.5 cursor-nesw-resize',
}

function Handle({ corner, onPointerDown }: HandleProps) {
  return (
    <div
      onPointerDown={onPointerDown}
      className={cn(
        'absolute size-3 rounded-sm border border-dashed border-muted-foreground bg-background shadow-sm',
        HANDLE_POSITION[corner],
      )}
    />
  )
}

function RotateHandle({ onPointerDown }: { onPointerDown: (e: React.PointerEvent) => void }) {
  return (
    <>
      <div className="pointer-events-none absolute -top-7 left-1/2 h-5 w-px -translate-x-1/2 bg-muted-foreground/50" />
      <div
        onPointerDown={onPointerDown}
        className="absolute -top-8 left-1/2 size-3.5 -translate-x-1/2 cursor-grab rounded-full border border-dashed border-muted-foreground bg-background shadow-sm"
      />
    </>
  )
}
