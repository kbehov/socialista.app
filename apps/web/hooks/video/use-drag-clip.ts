'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { collectClipSnapTargets, snapTime } from '@/lib/video/snap'
import { useVideoEditorStore } from '@/lib/video/store'
import type { ClipId, TrackId } from '@socialista/types'

type DragState = {
  clipId: ClipId
  startPointerX: number
  startStartTime: number
  startTrackId: TrackId
  pxPerSec: number
}

const TAP_THRESHOLD_PX = 5

/** Hook for moving a clip on the timeline (drag body). Returns handlers + current draft delta. */
export function useDragClip(pxPerSec: number) {
  const [drag, setDrag] = useState<{ clipId: ClipId; deltaSec: number; trackId: TrackId } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const stateRef = useRef<DragState | null>(null)
  const dragRef = useRef<{ clipId: ClipId; deltaSec: number; trackId: TrackId } | null>(null)
  const onTapRef = useRef<((clipId: ClipId) => void) | null>(null)
  const moveClip = useVideoEditorStore(s => s.moveClip)
  const setSnapGuideTime = useVideoEditorStore(s => s.setSnapGuideTime)
  const tracks = useVideoEditorStore(s => s.project.tracks)

  const onMove = useCallback(
    (e: PointerEvent) => {
      const it = stateRef.current
      if (!it) return
      e.preventDefault()
      const rawDeltaSec = (e.clientX - it.startPointerX) / it.pxPerSec
      const rawStart = Math.max(0, it.startStartTime + rawDeltaSec)

      const state = useVideoEditorStore.getState()
      const clip = state.project.clips[it.clipId]
      const candidates = collectClipSnapTargets({
        playhead: state.playhead,
        duration: state.project.duration,
        clips: Object.values(state.project.clips).map(c => ({
          id: c.id,
          startTime: c.startTime,
          duration: c.duration,
        })),
        excludeClipId: it.clipId,
      })
      // Also snap the clip's end edge
      if (clip) {
        for (const t of [...candidates]) {
          candidates.push(t - clip.duration)
        }
      }

      const snapped = snapTime(rawStart, candidates, it.pxPerSec, state.snapEnabled)
      setSnapGuideTime(snapped.guideTime)

      const deltaSec = snapped.time - it.startStartTime
      const next = { clipId: it.clipId, deltaSec, trackId: it.startTrackId }
      dragRef.current = next
      setDrag(next)
    },
    [setSnapGuideTime],
  )

  const stop = useCallback(() => {
    const it = stateRef.current
    const finalDrag = dragRef.current
    const onTap = onTapRef.current
    setSnapGuideTime(null)
    if (it && finalDrag) {
      const pixelDelta = Math.abs(finalDrag.deltaSec * it.pxPerSec)
      if (pixelDelta > TAP_THRESHOLD_PX) {
        const newStart = Math.max(0, it.startStartTime + finalDrag.deltaSec)
        moveClip(it.clipId, newStart, it.startTrackId)
      } else {
        onTap?.(it.clipId)
      }
    }
    stateRef.current = null
    dragRef.current = null
    onTapRef.current = null
    setDrag(null)
    setIsDragging(false)
  }, [moveClip, setSnapGuideTime])

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

  const beginDrag = (
    clipId: ClipId,
    startTime: number,
    trackId: TrackId,
    e: React.PointerEvent,
    onTap?: (clipId: ClipId) => void,
  ) => {
    if (e.button !== 0) return
    const track = tracks.find(t => t.id === trackId)
    if (!track || track.locked) return
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    onTapRef.current = onTap ?? null
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
