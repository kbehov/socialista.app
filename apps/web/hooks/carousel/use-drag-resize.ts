'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import type { TextLayer } from '@socialista/types'
import { clamp } from '@/lib/carousel/defaults'

export type Corner = 'nw' | 'ne' | 'se' | 'sw'

type Interaction =
  | {
      kind: 'drag'
      startPointerX: number
      startPointerY: number
      start: Pick<TextLayer, 'x' | 'y' | 'width' | 'height' | 'rotation'>
      canvasWidthPx: number
      canvasHeightPx: number
    }
  | {
      kind: 'resize'
      corner: Corner
      startPointerX: number
      startPointerY: number
      start: Pick<TextLayer, 'x' | 'y' | 'width' | 'height' | 'rotation'>
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

const X_MIN = -10
const Y_MIN = -10
const X_MAX = 100
const Y_MAX = 100
const W_MIN = 5
const H_MIN = 4

export function useDragResize(opts: {
  layer: TextLayer
  canvasRef: RefObject<HTMLElement | null>
  onCommit: (partial: Partial<TextLayer>) => void
}) {
  const { layer, canvasRef, onCommit } = opts
  const [draft, setDraft] = useState<Partial<TextLayer> | null>(null)
  const [isInteracting, setIsInteracting] = useState(false)
  const interaction = useRef<Interaction | null>(null)
  const draftRef = useRef<Partial<TextLayer> | null>(null)
  const onCommitRef = useRef(onCommit)

  useEffect(() => {
    onCommitRef.current = onCommit
  }, [onCommit])

  const updateDraft = useCallback((partial: Partial<TextLayer>) => {
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
          x: clamp(it.start.x + dxPct, X_MIN, X_MAX),
          y: clamp(it.start.y + dyPct, Y_MIN, Y_MAX),
        })
        return
      }

      if (it.kind === 'resize') {
        const dxPx = e.clientX - it.startPointerX
        const dyPx = e.clientY - it.startPointerY
        const r = (it.start.rotation * Math.PI) / 180
        const cos = Math.cos(-r)
        const sin = Math.sin(-r)
        const dxLocal = dxPx * cos - dyPx * sin
        const dyLocal = dxPx * sin + dyPx * cos
        const dxPct = (dxLocal / it.canvasWidthPx) * 100
        const dyPct = (dyLocal / it.canvasHeightPx) * 100

        let { x, y, width, height } = it.start
        switch (it.corner) {
          case 'se':
            width = it.start.width + dxPct
            height = it.start.height + dyPct
            break
          case 'nw':
            width = it.start.width - dxPct
            height = it.start.height - dyPct
            x = it.start.x + dxPct
            y = it.start.y + dyPct
            break
          case 'ne':
            width = it.start.width + dxPct
            height = it.start.height - dyPct
            y = it.start.y + dyPct
            break
          case 'sw':
            width = it.start.width - dxPct
            height = it.start.height + dyPct
            x = it.start.x + dxPct
            break
        }
        updateDraft({
          x: clamp(x, X_MIN, X_MAX),
          y: clamp(y, Y_MIN, Y_MAX),
          width: clamp(width, W_MIN, 100),
          height: clamp(height, H_MIN, 100),
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
      start: { x: layer.x, y: layer.y, width: layer.width, height: layer.height, rotation: layer.rotation },
      canvasWidthPx: rect.width,
      canvasHeightPx: rect.height,
    }
    setIsInteracting(true)
    updateDraft({ x: layer.x, y: layer.y })
  }

  const beginResize = (corner: Corner) => (e: React.PointerEvent) => {
    if (e.button !== 0) return
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    e.preventDefault()
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    interaction.current = {
      kind: 'resize',
      corner,
      startPointerX: e.clientX,
      startPointerY: e.clientY,
      start: { x: layer.x, y: layer.y, width: layer.width, height: layer.height, rotation: layer.rotation },
      canvasWidthPx: rect.width,
      canvasHeightPx: rect.height,
    }
    setIsInteracting(true)
    updateDraft({ x: layer.x, y: layer.y, width: layer.width, height: layer.height })
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
      startRotation: layer.rotation,
    }
    setIsInteracting(true)
    updateDraft({ rotation: layer.rotation })
  }

  return { draft, beginDrag, beginResize, beginRotate }
}
