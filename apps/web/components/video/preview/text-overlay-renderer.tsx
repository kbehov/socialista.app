'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { buildTextLayerCss } from '@/lib/carousel/text-style'
import { layerStyleFromOverlay } from '@/lib/video/defaults'
import { useOverlayInteraction } from '@/hooks/video/use-overlay-interaction'
import { useLayerSnap } from '@/hooks/editor/use-layer-snap'
import { LayerTransformHandles } from '@/components/editor/layer-transform-handles'
import { useVideoEditorStore } from '@/lib/video/store'
import type { TextOverlay } from '@socialista/types'
import type { Corner } from '@/hooks/editor/use-drag-resize'
import { cn } from '@/lib/utils'

type TextOverlayRendererProps = {
  artboardRef: RefObject<HTMLDivElement | null>
  scale: number
  onBackgroundPointerDown?: () => void
  editRequestId?: string | null
  onEditRequestHandled?: () => void
}

export function TextOverlayRenderer({
  artboardRef,
  scale,
  onBackgroundPointerDown,
  editRequestId,
  onEditRequestHandled,
}: TextOverlayRendererProps) {
  const overlays = useVideoEditorStore(s => s.project.textOverlays)
  const playhead = useVideoEditorStore(s => s.playhead)
  const isPlaying = useVideoEditorStore(s => s.isPlaying)
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const selectOverlay = useVideoEditorStore(s => s.selectOverlay)
  const updateOverlay = useVideoEditorStore(s => s.updateOverlay)
  const canvasSnapEnabled = useVideoEditorStore(s => s.canvasSnapEnabled)

  const interactive = !isPlaying
  const visible = overlays.filter(o => playhead >= o.startTime && playhead < o.endTime)
  const sorted = [...visible].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <div
      className={cn(
        'absolute inset-0 z-20',
        interactive ? 'pointer-events-auto' : 'pointer-events-none',
        interactive && 'cursor-default',
      )}
      onPointerDown={e => {
        if ((e.target as HTMLElement).closest('[data-clip-actions]')) return
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
          snapEnabled={canvasSnapEnabled}
          siblings={sorted.filter(o => o.id !== overlay.id)}
          editRequested={editRequestId === overlay.id}
          onEditRequestHandled={onEditRequestHandled}
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
  snapEnabled,
  siblings,
  editRequested,
  onEditRequestHandled,
  onSelect,
  onCommit,
}: {
  overlay: TextOverlay
  canvasRef: RefObject<HTMLElement | null>
  scale: number
  selected: boolean
  interactive: boolean
  snapEnabled: boolean
  siblings: TextOverlay[]
  editRequested?: boolean
  onEditRequestHandled?: () => void
  onSelect: () => void
  onCommit: (partial: Partial<TextOverlay>) => void
}) {
  const [isEditingContent, setIsEditingContent] = useState(false)
  const [heightPct, setHeightPct] = useState(12)
  const layerRef = useRef<HTMLDivElement>(null)
  const editRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editRequested) return
    setIsEditingContent(true)
    onEditRequestHandled?.()
  }, [editRequested, onEditRequestHandled])

  const others = useMemo(
    () =>
      siblings.map(o => ({
        id: o.id,
        x: o.x,
        y: o.y,
        width: o.width,
        height: 12,
      })),
    [siblings],
  )
  const snap = useLayerSnap({ others, enabled: snapEnabled })

  const { draft, beginDrag, beginResize, beginRotate } = useOverlayInteraction({
    overlay,
    canvasRef,
    onCommit,
    heightPct,
    snapTargets: snap.snapTargets,
    onGuidesChange: snap.onGuidesChange,
    snapEnabled,
  })

  const effective = useMemo(() => (draft ? { ...overlay, ...draft } : overlay), [overlay, draft])
  const textCss = useMemo(
    () => buildTextLayerCss(layerStyleFromOverlay(effective.style), scale),
    [effective.style, scale],
  )

  // Measure rendered height so vertical center snap matches the visible text box.
  useEffect(() => {
    const layer = layerRef.current
    const canvas = canvasRef.current
    if (!layer || !canvas) return

    const measure = () => {
      const canvasH = canvas.getBoundingClientRect().height
      if (canvasH <= 0) return
      const next = (layer.getBoundingClientRect().height / canvasH) * 100
      setHeightPct(prev => {
        const clamped = Math.max(2, Math.min(100, next))
        return Math.abs(prev - clamped) < 0.15 ? prev : clamped
      })
    }

    measure()
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    ro?.observe(layer)
    return () => ro?.disconnect()
  }, [canvasRef, effective.content, effective.style, effective.width, scale])

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

  const handleCornerResize = (corner: Corner) => beginResize(corner)

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
      ref={layerRef}
      data-video-overlay={overlay.id}
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
        <LayerTransformHandles onResize={handleCornerResize} onRotate={beginRotate} />
      ) : null}
    </div>
  )
}
