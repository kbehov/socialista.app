'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'

type DragState = {
  startPointerX: number
  startTime: number
  pxPerSec: number
}

type PlayheadProps = {
  pxPerSec: number
  headerWidth: number
}

export function Playhead({ pxPerSec, headerWidth }: PlayheadProps) {
  const playhead = useVideoEditorStore(s => s.playhead)
  const seek = useVideoEditorStore(s => s.seek)
  const pause = useVideoEditorStore(s => s.pause)
  const duration = useVideoEditorStore(s => s.project.duration)
  const [drag, setDrag] = useState<number | null>(null)
  const stateRef = useRef<DragState | null>(null)

  const onMove = useCallback(
    (e: PointerEvent) => {
      const it = stateRef.current
      if (!it) return
      e.preventDefault()
      const deltaSec = (e.clientX - it.startPointerX) / it.pxPerSec
      const next = Math.max(0, Math.min(it.startTime + deltaSec, duration))
      setDrag(next)
      seek(next)
    },
    [duration, seek],
  )

  const stop = useCallback(() => {
    stateRef.current = null
    setDrag(null)
  }, [])

  useEffect(() => {
    if (!stateRef.current) return
    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', stop, { once: true })
    window.addEventListener('pointercancel', stop, { once: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [onMove, stop])

  const beginDrag = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    pause()
    stateRef.current = { startPointerX: e.clientX, startTime: playhead, pxPerSec }
    setDrag(playhead)
  }

  const current = drag ?? playhead
  const left = current * pxPerSec

  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-30"
      style={{ left: headerWidth + left, width: 0 }}
    >
      <div
        className="pointer-events-auto absolute top-0 z-20 h-full cursor-ew-resize"
        style={{ left: 0 }}
        onPointerDown={beginDrag}
      >
        <div className="absolute top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-red-500 shadow-sm" />
        <div className="absolute top-0 h-full w-px -translate-x-1/2 bg-red-500" />
      </div>
    </div>
  )
}
