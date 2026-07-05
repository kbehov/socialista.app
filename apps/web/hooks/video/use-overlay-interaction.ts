'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { TextOverlay } from '@socialista/types'

export type OverlayResizeEdge = 'w' | 'e'

type Interaction =
  | {
      kind: 'drag'
      startPointerX: number
      startPointerY: number
      startX: number
      startY: number
      canvasWidthPx: number
      canvasHeightPx: number
    }
  | {
      kind: 'resize'
      edge: OverlayResizeEdge
      startPointerX: number
      startX: number
      startWidth: number
      canvasWidthPx: number
    }
  | {
      kind: 'rotate'
      centerX: number
      centerY: number
      startPointerX: number
      startPointerY: number
      startRotation: number
    }

const X_MIN = -10
const Y_MIN = -10
const X_MAX = 100
const Y_MAX = 100
const W_MIN = 5

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function useOverlayInteraction(opts: {
  overlay: TextOverlay
  canvasRef: RefObject<HTMLElement | null>
  onCommit: (partial: Partial<TextOverlay>) => void
}) {
  const { overlay, canvasRef, onCommit } = opts
  const [draft, setDraft] = useState<Partial<TextOverlay> | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)
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
    setIsInteracting(false)
    setDraft(null)

    if (toCommit) {
      onCommitRef.current(toCommit)
    }
  }, [])

  const onMove = useCallback(
    (e: PointerEvent) => {
      const it = interaction.current
      if (!it) return
      e.preventDefault()

      if (it.kind === 'drag') {
        const dxPct = ((e.clientX - it.startPointerX) / it.canvasWidthPx) * 100
        const dyPct = ((e.clientY - it.startPointerY) / it.canvasHeightPx) * 100
        updateDraft({
          x: clamp(it.startX + dxPct, X_MIN, X_MAX),
          y: clamp(it.startY + dyPct, Y_MIN, Y_MAX),
        })
        return
      }

      if (it.kind === 'resize') {
        const dxPct = ((e.clientX - it.startPointerX) / it.canvasWidthPx) * 100
        if (it.edge === 'e') {
          updateDraft({ width: clamp(it.startWidth + dxPct, W_MIN, 100) })
          return
        }
        const nextWidth = clamp(it.startWidth - dxPct, W_MIN, 100)
        const appliedDx = it.startWidth - nextWidth
        updateDraft({
          x: clamp(it.startX + appliedDx, X_MIN, X_MAX),
          width: nextWidth,
        })
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
    if (!isInteracting) return

    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [isInteracting, onMove, stop])

  const beginDrag = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    e.preventDefault()
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    interaction.current = {
      kind: 'drag',
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startX: overlay.x,
      startY: overlay.y,
      canvasWidthPx: rect.width,
      canvasHeightPx: rect.height,
    }
    setIsInteracting(true)
    updateDraft({ x: overlay.x, y: overlay.y })
  }

  const beginResize = (edge: OverlayResizeEdge) => (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    e.preventDefault()
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    interaction.current = {
      kind: 'resize',
      edge,
      startPointerX: e.clientX,
      startX: overlay.x,
      startWidth: overlay.width,
      canvasWidthPx: rect.width,
    }
    setIsInteracting(true)
    updateDraft({ x: overlay.x, width: overlay.width })
  }

  const beginRotate = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const layerEl = (e.currentTarget.parentElement as HTMLElement | null)?.getBoundingClientRect()
    if (!layerEl) return
    e.preventDefault()
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    interaction.current = {
      kind: 'rotate',
      centerX: layerEl.left + layerEl.width / 2,
      centerY: layerEl.top + layerEl.height / 2,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startRotation: overlay.rotation,
    }
    setIsInteracting(true)
    updateDraft({ rotation: overlay.rotation })
  }

  return { draft, isInteracting, beginDrag, beginResize, beginRotate }
}
