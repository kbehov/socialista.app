'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { BackgroundImageTransform } from '@socialista/types'
import { clamp, MAX_BACKGROUND_SCALE, MIN_BACKGROUND_SCALE } from '@/lib/carousel/defaults'
import { normalizeTransform, resolveTransformPixels } from '@/lib/carousel/background-image-style'

export type TransformCorner = 'nw' | 'ne' | 'se' | 'sw'

type Interaction =
  | {
      kind: 'pan'
      startPointerX: number
      startPointerY: number
      start: BackgroundImageTransform
      canvasWidthPx: number
      canvasHeightPx: number
    }
  | {
      kind: 'scale'
      corner: TransformCorner
      startPointerX: number
      startPointerY: number
      start: BackgroundImageTransform
      startDistance: number
      centerX: number
      centerY: number
      canvasWidthPx: number
      canvasHeightPx: number
    }

function pointerDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1)
}

function transformsEqual(a: BackgroundImageTransform, b: BackgroundImageTransform): boolean {
  return (
    a.scale === b.scale &&
    Math.abs(a.offsetX - b.offsetX) < 0.0001 &&
    Math.abs(a.offsetY - b.offsetY) < 0.0001
  )
}

export function useBackgroundImageTransform(opts: {
  transform: BackgroundImageTransform
  canvasRef: RefObject<HTMLElement | null>
  onCommit: (transform: BackgroundImageTransform) => void
  enabled?: boolean
}) {
  const { transform, canvasRef, onCommit, enabled = true } = opts
  const [draft, setDraft] = useState<BackgroundImageTransform | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const interaction = useRef<Interaction | null>(null)
  const draftRef = useRef<BackgroundImageTransform | null>(null)
  const onCommitRef = useRef(onCommit)

  useEffect(() => {
    onCommitRef.current = onCommit
  }, [onCommit])

  useEffect(() => {
    interaction.current = null
    draftRef.current = null
    setIsInteracting(false)
    setDraft(null)
  }, [transform.scale, transform.offsetX, transform.offsetY])

  const updateDraft = useCallback((next: BackgroundImageTransform) => {
    draftRef.current = next
    setDraft(next)
  }, [])

  const commitTransform = useCallback(
    (
      toCommit: BackgroundImageTransform,
      start: BackgroundImageTransform,
      canvasWidthPx: number,
      canvasHeightPx: number,
    ) => {
      if (transformsEqual(toCommit, start)) return
      const pixels = resolveTransformPixels(toCommit, canvasWidthPx, canvasHeightPx)
      onCommitRef.current(
        normalizeTransform(
          toCommit.scale,
          pixels.translateX,
          pixels.translateY,
          canvasWidthPx,
          canvasHeightPx,
        ),
      )
    },
    [],
  )

  const stop = useCallback(() => {
    if (!interaction.current) return
    const it = interaction.current
    interaction.current = null

    const toCommit = draftRef.current
    draftRef.current = null
    setIsInteracting(false)
    setDraft(null)

    if (toCommit) {
      commitTransform(toCommit, it.start, it.canvasWidthPx, it.canvasHeightPx)
    }
  }, [commitTransform])

  const flushPendingCommit = useCallback(() => {
    if (interaction.current) {
      stop()
      return
    }

    const pending = draftRef.current
    if (!pending || transformsEqual(pending, transform)) {
      draftRef.current = null
      setDraft(null)
      return
    }

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect || rect.width <= 0 || rect.height <= 0) return

    commitTransform(pending, transform, rect.width, rect.height)
    draftRef.current = null
    setDraft(null)
  }, [canvasRef, commitTransform, stop, transform])

  const onMove = useCallback(
    (e: PointerEvent) => {
      const it = interaction.current
      if (!it) return
      e.preventDefault()

      if (it.kind === 'pan') {
        const startPx = resolveTransformPixels(it.start, it.canvasWidthPx, it.canvasHeightPx)
        const dx = e.clientX - it.startPointerX
        const dy = e.clientY - it.startPointerY
        const scale = Math.max(MIN_BACKGROUND_SCALE, it.start.scale)
        const maxOffsetX = ((scale - 1) * it.canvasWidthPx) / 2
        const maxOffsetY = ((scale - 1) * it.canvasHeightPx) / 2

        updateDraft(
          normalizeTransform(
            scale,
            clamp(startPx.translateX + dx, -maxOffsetX, maxOffsetX),
            clamp(startPx.translateY + dy, -maxOffsetY, maxOffsetY),
            it.canvasWidthPx,
            it.canvasHeightPx,
          ),
        )
        return
      }

      const distance = pointerDistance(e.clientX, e.clientY, it.centerX, it.centerY)
      const ratio = it.startDistance > 0 ? distance / it.startDistance : 1
      const nextScale = clamp(it.start.scale * ratio, MIN_BACKGROUND_SCALE, MAX_BACKGROUND_SCALE)

      updateDraft({ ...it.start, scale: nextScale })
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

  useEffect(() => {
    if (enabled) return
    flushPendingCommit()
  }, [enabled, flushPendingCommit])

  const flushRef = useRef(flushPendingCommit)
  flushRef.current = flushPendingCommit
  useEffect(() => () => flushRef.current(), [])

  const beginPan = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    e.preventDefault()
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    interaction.current = {
      kind: 'pan',
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      start: transform,
      canvasWidthPx: rect.width,
      canvasHeightPx: rect.height,
    }
    setIsInteracting(true)
  }

  const beginScale = (corner: TransformCorner) => (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    e.preventDefault()
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)

    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    interaction.current = {
      kind: 'scale',
      corner,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      start: transform,
      startDistance: Math.max(pointerDistance(e.clientX, e.clientY, centerX, centerY), 1),
      centerX,
      centerY,
      canvasWidthPx: rect.width,
      canvasHeightPx: rect.height,
    }
    setIsInteracting(true)
  }

  return { draft, beginPan, beginScale, isInteracting, flushPendingCommit }
}
