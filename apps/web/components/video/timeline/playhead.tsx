'use client'

import { useCallback, useEffect, useState } from 'react'
import { formatTimecode } from '@/lib/video/timecode'
import { useVideoEditorStore } from '@/lib/video/store'
import { cn } from '@/lib/utils'

type PlayheadProps = {
  pxPerSec: number
  headerWidth: number
  onSeekAtClientX: (clientX: number) => void
}

export function Playhead({ pxPerSec, headerWidth, onSeekAtClientX }: PlayheadProps) {
  const playhead = useVideoEditorStore(s => s.playhead)
  const fps = useVideoEditorStore(s => s.project.fps)
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
      {isDragging ? (
        <div className="video-studio-glass absolute -top-0.5 left-1/2 z-30 -translate-x-1/2 -translate-y-full rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-foreground shadow-sm">
          {formatTimecode(playhead, fps)}
        </div>
      ) : null}
      <div
        className="pointer-events-auto absolute top-0 z-20 h-full w-5 -translate-x-1/2 cursor-ew-resize touch-none"
        onPointerDown={beginDrag}
        aria-label="Playhead"
      >
        <div
          className={cn(
            'absolute top-0 left-1/2 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-red-500 shadow-sm transition-transform duration-100',
            isDragging && 'scale-110',
          )}
        />
        <div className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-red-500" />
      </div>
    </div>
  )
}
