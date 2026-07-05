'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'
import type { TextOverlay } from '@socialista/types'

type Interaction =
  | { kind: 'drag'; startPointerX: number; startPointerY: number; startX: number; startY: number; rectW: number; rectH: number }
  | { kind: 'resize'; startPointerX: number; startPointerY: number; startX: number; startY: number; startWidth: number; rectW: number; rectH: number }
  | { kind: 'rotate'; centerX: number; centerY: number; startPointerX: number; startPointerY: number; startRotation: number }

const X_MIN = -10
const Y_MIN = -10
const X_MAX = 100
const Y_MAX = 100
const W_MIN = 5

export function TextOverlayRenderer({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement | null> }) {
  const overlays = useVideoEditorStore(s => s.project.textOverlays)
  const playhead = useVideoEditorStore(s => s.playhead)
  const isPlaying = useVideoEditorStore(s => s.isPlaying)
  const selectedOverlayId = useVideoEditorStore(s => s.selectedOverlayId)
  const selectOverlay = useVideoEditorStore(s => s.selectOverlay)
  const updateOverlay = useVideoEditorStore(s => s.updateOverlay)
  const canvasElement = canvasRef.current
  void canvasElement

  const visible = overlays.filter(o => playhead >= o.startTime && playhead < o.endTime)
  const sorted = [...visible].sort((a, b) => a.zIndex - b.zIndex)

  return (
    <>
      {sorted.map(overlay => (
        <OverlayNode
          key={overlay.id}
          overlay={overlay}
          canvasRef={canvasRef}
          selected={overlay.id === selectedOverlayId}
          isEditing={!isPlaying}
          onSelect={() => selectOverlay(overlay.id)}
          onCommit={partial => updateOverlay(overlay.id, partial)}
        />
      ))}
    </>
  )
}

function OverlayNode({
  overlay,
  canvasRef,
  selected,
  isEditing,
  onSelect,
  onCommit,
}: {
  overlay: TextOverlay
  canvasRef: RefObject<HTMLCanvasElement | null>
  selected: boolean
  isEditing: boolean
  onSelect: () => void
  onCommit: (partial: Partial<TextOverlay>) => void
}) {
  const [draft, setDraft] = useState<Partial<TextOverlay> | null>(null)
  const interaction = useRef<Interaction | null>(null)
  const draftRef = useRef<Partial<TextOverlay> | null>(null)
  const onCommitRef = useRef(onCommit)
  useEffect(() => {
    onCommitRef.current = onCommit
  }, [onCommit])

  const updateDraft = useCallback((partial: Partial<TextOverlay>) => {
    draftRef.current = partial
    setDraft(partial)
  }, [])

  const stop = useCallback(() => {
    if (!interaction.current) return
    interaction.current = null
    const toCommit = draftRef.current
    draftRef.current = null
    setDraft(null)
    if (toCommit) onCommitRef.current(toCommit)
  }, [])

  const onMove = useCallback(
    (e: PointerEvent) => {
      const it = interaction.current
      if (!it) return
      e.preventDefault()
      if (it.kind === 'drag') {
        const dxPct = ((e.clientX - it.startPointerX) / it.rectW) * 100
        const dyPct = ((e.clientY - it.startPointerY) / it.rectH) * 100
        updateDraft({
          x: clamp(it.startX + dxPct, X_MIN, X_MAX),
          y: clamp(it.startY + dyPct, Y_MIN, Y_MAX),
        })
        return
      }
      if (it.kind === 'resize') {
        const dxPct = ((e.clientX - it.startPointerX) / it.rectW) * 100
        updateDraft({ width: clamp(it.startWidth + dxPct, W_MIN, 100) })
        return
      }
      if (it.kind === 'rotate') {
        const startAngle = Math.atan2(it.startPointerY - it.centerY, it.startPointerX - it.centerX)
        const currentAngle = Math.atan2(e.clientY - it.centerY, e.clientX - it.centerX)
        const delta = ((currentAngle - startAngle) * 180) / Math.PI
        updateDraft({ rotation: Math.round((it.startRotation + delta) % 360) })
      }
    },
    [updateDraft],
  )

  useEffect(() => {
    if (!interaction.current) return
    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [onMove, stop])

  const beginDrag = (e: React.PointerEvent) => {
    if (!isEditing || e.button !== 0) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    e.preventDefault()
    e.stopPropagation()
    onSelect()
    interaction.current = {
      kind: 'drag',
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startX: overlay.x,
      startY: overlay.y,
      rectW: rect.width,
      rectH: rect.height,
    }
    updateDraft({ x: overlay.x, y: overlay.y })
  }

  const beginResize = (e: React.PointerEvent) => {
    if (!isEditing || e.button !== 0) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    e.preventDefault()
    e.stopPropagation()
    onSelect()
    interaction.current = {
      kind: 'resize',
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startX: overlay.x,
      startY: overlay.y,
      startWidth: overlay.width,
      rectW: rect.width,
      rectH: rect.height,
    }
    updateDraft({ width: overlay.width })
  }

  const beginRotate = (e: React.PointerEvent) => {
    if (!isEditing || e.button !== 0) return
    const overlayEl = (e.currentTarget.parentElement as HTMLElement | null)?.getBoundingClientRect()
    if (!overlayEl) return
    e.preventDefault()
    e.stopPropagation()
    onSelect()
    interaction.current = {
      kind: 'rotate',
      centerX: overlayEl.left + overlayEl.width / 2,
      centerY: overlayEl.top + overlayEl.height / 2,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startRotation: overlay.rotation,
    }
    updateDraft({ rotation: overlay.rotation })
  }

  const effective = draft ? { ...overlay, ...draft } : overlay
  const animation = overlay.style.animation ?? 'none'
  const animationClass =
    isEditing && animation === 'fade'
      ? 'animate-in fade-in'
      : isEditing && animation === 'slide-up'
        ? 'animate-in slide-in-from-bottom-2'
        : isEditing && animation === 'slide-down'
          ? 'animate-in slide-in-from-top-2'
          : ''

  return (
    <div
      onPointerDown={beginDrag}
      className={`absolute select-none ${isEditing ? 'cursor-move' : 'pointer-events-none'} ${animationClass} ${isEditing && selected ? 'ring-2 ring-blue-500' : ''}`}
      style={{
        left: `${effective.x}%`,
        top: `${effective.y}%`,
        width: `${effective.width}%`,
        transform: `rotate(${effective.rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: effective.zIndex,
      }}
    >
      <div
        className="px-2 py-1"
        style={{
          fontFamily: effective.style.fontFamily,
          fontSize: effective.style.fontSize,
          fontWeight: effective.style.fontWeight,
          color: effective.style.color,
          backgroundColor: effective.style.backgroundColor ?? 'transparent',
          textAlign: effective.style.textAlign,
          letterSpacing: effective.style.letterSpacing,
          lineHeight: effective.style.lineHeight,
          padding: effective.style.padding,
          borderRadius: effective.style.borderRadius,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
      >
        {effective.content || ' '}
      </div>
      {isEditing && selected && (
        <>
          <Handle className="left-0 top-1/2 -translate-y-1/2 -translate-x-1/2" onPointerDown={beginResize} />
          <Handle className="right-0 top-1/2 -translate-y-1/2 translate-x-1/2" onPointerDown={beginResize} />
          <Handle className="left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rotate-handle" onPointerDown={beginRotate} />
        </>
      )}
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
      className={`absolute h-3 w-3 rounded-full border-2 border-blue-500 bg-white ${className}`}
    />
  )
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}
