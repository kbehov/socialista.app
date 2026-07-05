'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'
import type { ClipId, TrackId } from '@socialista/types'

type DragState = {
  clipId: ClipId
  startPointerX: number
  startStartTime: number
  startTrackId: TrackId
  pxPerSec: number
}

/** Hook for moving a clip on the timeline (drag body). Returns handlers + current draft delta. */
export function useDragClip(pxPerSec: number) {
  const [drag, setDrag] = useState<{ clipId: ClipId; deltaSec: number; trackId: TrackId } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const stateRef = useRef<DragState | null>(null)
  const dragRef = useRef<{ clipId: ClipId; deltaSec: number; trackId: TrackId } | null>(null)
  const moveClip = useVideoEditorStore(s => s.moveClip)
  const tracks = useVideoEditorStore(s => s.project.tracks)

  const onMove = useCallback(
    (e: PointerEvent) => {
      const it = stateRef.current
      if (!it) return
      e.preventDefault()
      const deltaSec = (e.clientX - it.startPointerX) / it.pxPerSec
      const next = { clipId: it.clipId, deltaSec, trackId: it.startTrackId }
      dragRef.current = next
      setDrag(next)
    },
    [],
  )

  const stop = useCallback(() => {
    const it = stateRef.current
    const finalDrag = dragRef.current
    if (it && finalDrag) {
      const newStart = Math.max(0, it.startStartTime + finalDrag.deltaSec)
      moveClip(it.clipId, newStart, it.startTrackId)
    }
    stateRef.current = null
    dragRef.current = null
    setDrag(null)
    setIsDragging(false)
  }, [moveClip])

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

  const beginDrag = (clipId: ClipId, startTime: number, trackId: TrackId, e: React.PointerEvent) => {
    if (e.button !== 0) return
    const track = tracks.find(t => t.id === trackId)
    if (!track || track.locked) return
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    stateRef.current = {
      clipId,
      startPointerX: e.clientX,
      startStartTime: startTime,
      startTrackId: trackId,
      pxPerSec,
    }
    const initial = { clipId, deltaSec: 0, trackId }
    dragRef.current = initial
    setDrag(initial)
    setIsDragging(true)
  }

  return { beginDrag, drag }
}
