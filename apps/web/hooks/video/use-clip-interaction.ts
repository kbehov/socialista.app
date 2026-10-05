'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { ClipTransform } from '@socialista/types'
import { SNAP_THRESHOLD_PCT, snapLayerPosition, type SnapGuide, type SnapTarget } from '@/lib/editor/snap-guides'
import {
  CLIP_POS_MAX,
  CLIP_POS_MIN,
  clampGesture,
  resizeClipFromPointer,
  type ClipResizeHandle,
} from '@/lib/video/clip-gesture'

export type { ClipResizeHandle }

type Interaction =
  | {
      kind: 'drag'
      startPointerX: number
      startPointerY: number
      startX: number
      startY: number
      startWidth: number
      startHeightPct: number
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
      startRotation: number
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

export function useClipInteraction(opts: {
  transform: ClipTransform
  heightPct: number
  canvasRef: RefObject<HTMLElement | null>
  onCommit: (partial: Partial<ClipTransform>) => void
  onLiveUpdate: (partial: Partial<ClipTransform>) => void
  snapTargets?: SnapTarget[]
  onGuidesChange?: (guides: SnapGuide[]) => void
  snapEnabled?: boolean
}) {
  const {
    transform,
    heightPct,
    canvasRef,
    onCommit,
    onLiveUpdate,
    snapTargets = [],
    onGuidesChange,
    snapEnabled = true,
  } = opts
  const [draft, setDraft] = useState<Partial<ClipTransform> | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const interaction = useRef<Interaction | null>(null)
  const draftRef = useRef<Partial<ClipTransform> | null>(null)
  const transformRef = useRef(transform)
  const onCommitRef = useRef(onCommit)
  const onLiveUpdateRef = useRef(onLiveUpdate)
  const snapTargetsRef = useRef(snapTargets)
  const onGuidesChangeRef = useRef(onGuidesChange)
  const snapEnabledRef = useRef(snapEnabled)
  const detachRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    onCommitRef.current = onCommit
    onLiveUpdateRef.current = onLiveUpdate
  }, [onCommit, onLiveUpdate])

  useEffect(() => {
    // Keep a ref for reads during drag, but don't overwrite the in-flight draft.
    if (!interaction.current) transformRef.current = transform
  }, [transform])

  useEffect(() => {
    snapTargetsRef.current = snapTargets
  }, [snapTargets])

  useEffect(() => {
    onGuidesChangeRef.current = onGuidesChange
  }, [onGuidesChange])

  useEffect(() => {
    snapEnabledRef.current = snapEnabled
  }, [snapEnabled])

  const updateDraft = useCallback((partial: Partial<ClipTransform>) => {
    const base = draftRef.current ?? transformRef.current
    const next = { ...base, ...partial }
    draftRef.current = next
    setDraft(next)
    // Push the full transform so live preview stays in sync without stale merges.
    onLiveUpdateRef.current(next)
  }, [])

  const stop = useCallback(() => {
    detachRef.current?.()
    detachRef.current = null
    if (!interaction.current) return
    interaction.current = null

    const toCommit = draftRef.current
    draftRef.current = null
    setIsInteracting(false)
    setDraft(null)
    onGuidesChangeRef.current?.([])

    if (toCommit) {
      onCommitRef.current(toCommit)
    }
  }, [])

  const onMove = useCallback((e: PointerEvent) => {
    const it = interaction.current
    if (!it) return
    e.preventDefault()

    if (it.kind === 'drag') {
      const dxPct = ((e.clientX - it.startPointerX) / it.canvasWidthPx) * 100
      const dyPct = ((e.clientY - it.startPointerY) / it.canvasHeightPx) * 100
      let nextX = it.startX + dxPct
      let nextY = it.startY + dyPct

      if (snapEnabledRef.current) {
        const snapped = snapLayerPosition({
          x: nextX,
          y: nextY,
          width: it.startWidth,
          height: it.startHeightPct,
          others: snapTargetsRef.current,
        })
        const rawDist = Math.hypot(nextX - it.startX, nextY - it.startY)
        const snapDist = Math.hypot(snapped.x - it.startX, snapped.y - it.startY)
        // A cover-fit clip already sits on the canvas edges and center. Honor the
        // pointer until it leaves that snap well, otherwise slow drags do nothing
        // and then the clip jumps.
        const breakingAway = snapDist < rawDist - 0.001 && rawDist < SNAP_THRESHOLD_PCT
        if (breakingAway) {
          onGuidesChangeRef.current?.([])
        } else {
          nextX = snapped.x
          nextY = snapped.y
          onGuidesChangeRef.current?.(snapped.guides)
        }
      } else {
        onGuidesChangeRef.current?.([])
      }

      updateDraft({
        x: clampGesture(nextX, CLIP_POS_MIN, CLIP_POS_MAX, it.startX),
        y: clampGesture(nextY, CLIP_POS_MIN, CLIP_POS_MAX, it.startY),
      })
      return
    }

    if (it.kind === 'resize') {
      onGuidesChangeRef.current?.([])
      const next = resizeClipFromPointer({
        handle: it.handle,
        pointerDx: e.clientX - it.startPointerX,
        pointerDy: e.clientY - it.startPointerY,
        startX: it.startX,
        startY: it.startY,
        startWidth: it.startWidth,
        startHeightPct: it.startHeightPct,
        rotation: it.startRotation,
        canvasWidthPx: it.canvasWidthPx,
        canvasHeightPx: it.canvasHeightPx,
      })
      updateDraft(next)
      return
    }

    if (it.kind === 'rotate') {
      const startAngle = Math.atan2(it.startPointerY - it.centerY, it.startPointerX - it.centerX)
      const currentAngle = Math.atan2(e.clientY - it.centerY, e.clientX - it.centerX)
      const delta = ((currentAngle - startAngle) * 180) / Math.PI
      onGuidesChangeRef.current?.([])
      updateDraft({ rotation: Math.round((it.startRotation + delta) % 360) })
    }
  }, [updateDraft])

  useEffect(() => {
    return () => {
      detachRef.current?.()
      detachRef.current = null
    }
  }, [])

  const attachListeners = () => {
    if (detachRef.current) return
    const handleMove = (e: PointerEvent) => onMove(e)
    const handleStop = () => stop()
    window.addEventListener('pointermove', handleMove, { passive: false })
    window.addEventListener('pointerup', handleStop)
    window.addEventListener('pointercancel', handleStop)
    detachRef.current = () => {
      window.removeEventListener('pointermove', handleMove)
      window.removeEventListener('pointerup', handleStop)
      window.removeEventListener('pointercancel', handleStop)
    }
  }

  const canvasSize = () => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return null
    return {
      canvasWidthPx: Math.max(1, rect.width),
      canvasHeightPx: Math.max(1, rect.height),
    }
  }

  const beginDrag = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const size = canvasSize()
    if (!size) return
    e.preventDefault()
    e.stopPropagation()
    const start = draftRef.current ?? transform
    transformRef.current = { ...transform, ...start }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    interaction.current = {
      kind: 'drag',
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startX: start.x ?? transform.x,
      startY: start.y ?? transform.y,
      startWidth: start.width ?? transform.width,
      startHeightPct: heightPct,
      ...size,
    }
    setIsInteracting(true)
    attachListeners()
    updateDraft({ x: start.x ?? transform.x, y: start.y ?? transform.y })
  }

  const beginResize = (handle: ClipResizeHandle) => (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const size = canvasSize()
    if (!size) return
    e.preventDefault()
    e.stopPropagation()
    const start = draftRef.current ?? transform
    const startWidth = start.width ?? transform.width
    const startX = start.x ?? transform.x
    const startY = start.y ?? transform.y
    const startRotation = start.rotation ?? transform.rotation
    transformRef.current = { ...transform, ...start }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    interaction.current = {
      kind: 'resize',
      handle,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startX,
      startY,
      startWidth,
      startHeightPct: heightPct,
      startRotation,
      ...size,
    }
    setIsInteracting(true)
    attachListeners()
    updateDraft({ x: startX, y: startY, width: startWidth, rotation: startRotation })
  }

  const beginRotate = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const layerEl = (e.currentTarget.parentElement as HTMLElement | null)?.getBoundingClientRect()
    if (!layerEl) return
    e.preventDefault()
    e.stopPropagation()
    const start = draftRef.current ?? transform
    const startRotation = start.rotation ?? transform.rotation
    transformRef.current = { ...transform, ...start }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    interaction.current = {
      kind: 'rotate',
      centerX: layerEl.left + layerEl.width / 2,
      centerY: layerEl.top + layerEl.height / 2,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      startRotation,
    }
    setIsInteracting(true)
    attachListeners()
    updateDraft({ rotation: startRotation })
  }

  return { draft, isInteracting, beginDrag, beginResize, beginRotate }
}
