'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { ClipTransform } from '@socialista/types'
import { clamp } from '@/lib/video/defaults'

export type ClipResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

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
      handle: ClipResizeHandle
      startPointerX: number
      startPointerY: number
      startX: number
      startY: number
      startWidth: number
      startHeightPct: number
      aspect: number
      canvasWidthPx: number
      canvasHeightPx: number
    }
  | {
      kind: 'rotate'
      centerX: number
      centerY: number
      startPointerX: number
      startPointerY: number
      startRotation: number
    }

const X_MIN = -20
const Y_MIN = -20
const X_MAX = 120
const Y_MAX = 120
const W_MIN = 5
const W_MAX = 200

export function useClipInteraction(opts: {
  transform: ClipTransform
  heightPct: number
  mediaAspect: number
  canvasRef: RefObject<HTMLElement | null>
  onCommit: (partial: Partial<ClipTransform>) => void
  onLiveUpdate: (partial: Partial<ClipTransform>) => void
}) {
  const { transform, heightPct, mediaAspect, canvasRef, onCommit, onLiveUpdate } = opts
  const [draft, setDraft] = useState<Partial<ClipTransform> | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const interaction = useRef<Interaction | null>(null)
  const draftRef = useRef<Partial<ClipTransform> | null>(null)
  const onCommitRef = useRef(onCommit)
  const onLiveUpdateRef = useRef(onLiveUpdate)

  useEffect(() => {
    onCommitRef.current = onCommit
    onLiveUpdateRef.current = onLiveUpdate
  }, [onCommit, onLiveUpdate])

  const updateDraft = useCallback(
    (partial: Partial<ClipTransform>) => {
      const next = { ...transform, ...draftRef.current, ...partial }
      draftRef.current = next
      setDraft(next)
      onLiveUpdateRef.current(partial)
    },
    [transform],
  )

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
        const dyPct = ((e.clientY - it.startPointerY) / it.canvasHeightPx) * 100
        const handle = it.handle

        let nextWidth = it.startWidth
        let nextX = it.startX
        let nextY = it.startY

        const heightFromWidth = (w: number) => (w * it.canvasWidthPx) / (it.aspect * it.canvasHeightPx)

        if (handle === 'nw' || handle === 'ne' || handle === 'sw' || handle === 'se') {
          const scaleX = handle.includes('e')
            ? (it.startWidth + dxPct) / it.startWidth
            : (it.startWidth - dxPct) / it.startWidth
          const scaleY = handle.includes('s')
            ? (it.startHeightPct + dyPct) / it.startHeightPct
            : (it.startHeightPct - dyPct) / it.startHeightPct
          const scale = Math.max(scaleX, scaleY)
          nextWidth = clamp(it.startWidth * scale, W_MIN, W_MAX)
          const nextHeight = heightFromWidth(nextWidth)
          if (handle.includes('w')) {
            nextX = it.startX + it.startWidth - nextWidth
          }
          if (handle.includes('n')) {
            nextY = it.startY + it.startHeightPct - nextHeight
          }
        } else if (handle === 'e') {
          nextWidth = clamp(it.startWidth + dxPct, W_MIN, W_MAX)
        } else if (handle === 'w') {
          nextWidth = clamp(it.startWidth - dxPct, W_MIN, W_MAX)
          nextX = it.startX + (it.startWidth - nextWidth)
        } else if (handle === 's') {
          nextWidth = clamp(it.startWidth + dyPct * it.aspect, W_MIN, W_MAX)
        } else if (handle === 'n') {
          const newHeight = clamp(it.startHeightPct - dyPct, W_MIN / it.aspect, W_MAX / it.aspect)
          const deltaH = it.startHeightPct - newHeight
          nextWidth = clamp((newHeight * it.aspect * it.canvasHeightPx) / it.canvasWidthPx, W_MIN, W_MAX)
          nextY = it.startY + deltaH
          nextX = it.startX + (it.startWidth - nextWidth) / 2
        }

        updateDraft({
          x: clamp(nextX, X_MIN, X_MAX),
          y: clamp(nextY, Y_MIN, Y_MAX),
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
      startX: transform.x,
      startY: transform.y,
      canvasWidthPx: rect.width,
      canvasHeightPx: rect.height,
    }
    setIsInteracting(true)
    updateDraft({ x: transform.x, y: transform.y })
  }

  const beginResize = (handle: ClipResizeHandle) => (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    e.preventDefault()
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    interaction.current = {
      kind: 'resize',
      handle,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startX: transform.x,
      startY: transform.y,
      startWidth: transform.width,
      startHeightPct: heightPct,
      aspect: mediaAspect,
      canvasWidthPx: rect.width,
      canvasHeightPx: rect.height,
    }
    setIsInteracting(true)
    updateDraft({ x: transform.x, y: transform.y, width: transform.width })
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
      startRotation: transform.rotation,
    }
    setIsInteracting(true)
    updateDraft({ rotation: transform.rotation })
  }

  return { draft, isInteracting, beginDrag, beginResize, beginRotate }
}
