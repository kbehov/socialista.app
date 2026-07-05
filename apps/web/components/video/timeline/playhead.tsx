'use client'

import { useCallback, useEffect, useState } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'

type PlayheadProps = {
  pxPerSec: number
  headerWidth: number
  onSeekAtClientX: (clientX: number) => void
}

export function Playhead({ pxPerSec, headerWidth, onSeekAtClientX }: PlayheadProps) {
  const playhead = useVideoEditorStore(s => s.playhead)
  const pause = useVideoEditorStore(s => s.pause)
  const [isDragging, setIsDragging] = useState(false)

  const onMove = useCallback(
    (e: PointerEvent) => {
      e.preventDefault()
      onSeekAtClientX(e.clientX)
    },
    [onSeekAtClientX],
  )

  const stop = useCallback(() => {
    setIsDragging(false)
  }, [])

  useEffect(() => {
    if (!isDragging) return

    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', stop)
    window.addEventListener('pointercancel', stop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', stop)
      window.removeEventListener('pointercancel', stop)
    }
  }, [isDragging, onMove, stop])

  const beginDrag = (e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    pause()
    setIsDragging(true)
    onSeekAtClientX(e.clientX)
  }

  const left = playhead * pxPerSec

  return (
    <div
      className="pointer-events-none absolute inset-y-0 z-30"
      style={{ left: headerWidth + left, width: 0 }}
    >
      <div
        className="pointer-events-auto absolute top-0 z-20 h-full w-3 -translate-x-1/2 cursor-ew-resize"
        onPointerDown={beginDrag}
      >
        <div className="absolute top-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-red-500 shadow-sm" />
        <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-red-500" />
      </div>
    </div>
  )
}
