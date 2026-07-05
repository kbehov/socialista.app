'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { buildTextLayerCss } from '@/lib/carousel/text-style'
import { useOverlayInteraction } from '@/hooks/video/use-overlay-interaction'
import { useVideoEditorStore } from '@/lib/video/store'
import type { TextOverlay } from '@socialista/types'
import { cn } from '@/lib/utils'

type TextOverlayRendererProps = {
  artboardRef: RefObject<HTMLDivElement | null>
  scale: number
  onBackgroundPointerDown?: () => void
}

export function TextOverlayRenderer({
  artboardRef,
  scale,
  onBackgroundPointerDown,
}: TextOverlayRendererProps) {
  const overlays = useVideoEditorStore(s => s.project.textOverlays)
  const playhead = useVideoEditorStore(s => s.playhead)
  const isPlaying = useVideoEditorStore(s => s.isPlaying)
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const selectOverlay = useVideoEditorStore(s => s.selectOverlay)
  const updateOverlay = useVideoEditorStore(s => s.updateOverlay)

  const interactive = !isPlaying
  const visible = overlays.filter(o => playhead >= o.startTime && playhead < o.endTime)
  const sorted = [...visible].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div
      className={cn('absolute inset-0 z-20', interactive ? 'pointer-events-auto' : 'pointer-events-none')}
      onPointerDown={e => {
        if (e.target === e.currentTarget) {
          onBackgroundPointerDown?.()
        }
      }}
    >
      {sorted.map(overlay => (
        <OverlayNode
          key={overlay.id}
          overlay={overlay}
          canvasRef={artboardRef}
          scale={scale}
          selected={overlay.id === selectedOverlayId}
          interactive={interactive}
          onSelect={() => selectOverlay(overlay.id)}
          onCommit={partial => updateOverlay(overlay.id, partial)}
        />
      ))}
    </div>
  )
}

function OverlayNode({
  overlay,
  canvasRef,
  scale,
  selected,
  interactive,
  onSelect,
  onCommit,
}: {
  overlay: TextOverlay
  canvasRef: RefObject<HTMLElement | null>
  scale: number
  selected: boolean
  interactive: boolean
  onSelect: () => void
  onCommit: (partial: Partial<TextOverlay>) => void
}) {
  const [isEditingContent, setIsEditingContent] = useState(false)
  const editRef = useRef<HTMLDivElement>(null)

  const { draft, beginDrag, beginResize, beginRotate } = useOverlayInteraction({
    overlay,
    canvasRef,
    onCommit,
  })

  const effective = useMemo(() => (draft ? { ...overlay, ...draft } : overlay), [overlay, draft])
  const textCss = useMemo(() => buildTextLayerCss(effective.style, scale), [effective.style, scale])

  useEffect(() => {
    if (!isEditingContent || !editRef.current) return

    editRef.current.innerText = overlay.content || ''
    editRef.current.focus({ preventScroll: true })

    const range = document.createRange()
    range.selectNodeContents(editRef.current)
    range.collapse(false)

    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)
  }, [isEditingContent, overlay.id, overlay.content])

  const commitContentEdit = useCallback(() => {
    if (!editRef.current) return
    const next = editRef.current.innerText.replace(/\r\n/g, '\n').trim()
    if (next !== overlay.content.trim()) {
      onCommit({ content: next || ' ' })
    }
    setIsEditingContent(false)
  }, [onCommit, overlay.content])

  const canDrag = interactive && !isEditingContent
  const canSelect = interactive

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canSelect && !canDrag) return
    if (canSelect) {
      e.stopPropagation()
      onSelect()
    }
    if (canDrag) {
      beginDrag(e)
    }
  }

  const animation = overlay.style.animation ?? 'none'
  const animationClass =
    interactive && animation === 'fade'
      ? 'animate-in fade-in'
      : interactive && animation === 'slide-up'
        ? 'animate-in slide-in-from-bottom-2'
        : interactive && animation === 'slide-down'
          ? 'animate-in slide-in-from-top-2'
          : ''

  return (
    <div
      className={cn(
        'absolute select-none',
        canDrag && 'cursor-move',
        canSelect && !canDrag && 'cursor-pointer',
        isEditingContent && 'cursor-text',
        animationClass,
      )}
      style={{
        left: `${effective.x}%`,
        top: `${effective.y}%`,
        width: `${effective.width}%`,
        transform: `rotate(${effective.rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: effective.zIndex,
      }}
      onPointerDown={canSelect || canDrag ? handlePointerDown : undefined}
      onDoubleClick={interactive && canSelect ? () => setIsEditingContent(true) : undefined}
    >
      <div
        ref={editRef}
        contentEditable={isEditingContent}
        suppressContentEditableWarning
        onBlur={commitContentEdit}
        onKeyDown={
          isEditingContent
            ? e => {
                e.stopPropagation()
                if (e.key === 'Escape') {
                  e.preventDefault()
                  commitContentEdit()
                }
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault()
                  commitContentEdit()
                }
              }
            : undefined
        }
        className={cn(
          'block w-full break-words whitespace-pre-wrap',
          isEditingContent
            ? 'min-h-[1em] cursor-text outline-none ring-2 ring-primary/60'
            : 'overflow-hidden',
        )}
        style={textCss}
      >
        {isEditingContent ? null : effective.content || ' '}
      </div>

      {selected && interactive && !isEditingContent ? (
        <>
          <div className="pointer-events-none absolute inset-0 rounded-sm border border-dashed border-primary/70" />
          <Handle className="left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" onPointerDown={beginResize('w')} />
          <Handle className="right-0 top-1/2 translate-x-1/2 -translate-y-1/2" onPointerDown={beginResize('e')} />
          <Handle
            className="left-1/2 top-0 -translate-x-1/2 -translate-y-1/2"
            onPointerDown={beginRotate}
          />
        </>
      ) : null}
    </div>
  )
}

function Handle({
  className,
  onPointerDown,
}: {
  className: string
  onPointerDown: (e: React.PointerEvent) => void
}) {
  return (
    <div
      onPointerDown={onPointerDown}
      className={cn(
        'absolute z-10 h-3 w-3 rounded-full border-2 border-primary bg-background shadow-sm',
        className,
      )}
    />
  )
}
