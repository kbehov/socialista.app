'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useVideoEditorStore } from '@/lib/video/store'

type Mode = 'move' | 'trim-start' | 'trim-end'

type DragState = {
  overlayId: string
  mode: Mode
  startPointerX: number
  startStartTime: number
  startEndTime: number
  pxPerSec: number
}

const MIN_DURATION = 0.2

export type OverlayTimingDraft = {
  overlayId: string
  startTime: number
  endTime: number
}

/** Drag or trim a text overlay on the timeline. */
export function useDragOverlay(pxPerSec: number) {
  const [draft, setDraft] = useState<OverlayTimingDraft | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const stateRef = useRef<DragState | null>(null)
  const draftRef = useRef<OverlayTimingDraft | null>(null)
  const setOverlayTiming = useVideoEditorStore(s => s.setOverlayTiming)

  const applyDraft = useCallback((next: OverlayTimingDraft) => {
    draftRef.current = next
    setDraft(next)
  }, [])

  const onMove = useCallback(
    (e: PointerEvent) => {
      const it = stateRef.current
      if (!it) return
      e.preventDefault()
      const deltaSec = (e.clientX - it.startPointerX) / it.pxPerSec

      if (it.mode === 'move') {
        const duration = it.startEndTime - it.startStartTime
        const newStart = Math.max(0, it.startStartTime + deltaSec)
        applyDraft({
          overlayId: it.overlayId,
          startTime: newStart,
          endTime: newStart + duration,
        })
        return
      }

      if (it.mode === 'trim-start') {
        const newStart = Math.max(0, Math.min(it.startEndTime - MIN_DURATION, it.startStartTime + deltaSec))
        applyDraft({
          overlayId: it.overlayId,
          startTime: newStart,
          endTime: it.startEndTime,
        })
        return
      }

      const newEnd = Math.max(it.startStartTime + MIN_DURATION, it.startEndTime + deltaSec)
      applyDraft({
        overlayId: it.overlayId,
        startTime: it.startStartTime,
        endTime: newEnd,
      })
    },
    [applyDraft],
  )

  const stop = useCallback(() => {
    const it = stateRef.current
    const finalDraft = draftRef.current
    if (it && finalDraft) {
      setOverlayTiming(finalDraft.overlayId, finalDraft.startTime, finalDraft.endTime)
    }
    stateRef.current = null
    draftRef.current = null
    setDraft(null)
    setIsDragging(false)
  }, [setOverlayTiming])

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

  const beginInteraction = (
    overlayId: string,
    mode: Mode,
    startTime: number,
    endTime: number,
    e: React.PointerEvent,
  ) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    stateRef.current = {
      overlayId,
      mode,
      startPointerX: e.clientX,
      startStartTime: startTime,
      startEndTime: endTime,
      pxPerSec,
    }
    applyDraft({ overlayId, startTime, endTime })
    setIsDragging(true)
  }

  const beginMove = (overlayId: string, startTime: number, endTime: number, e: React.PointerEvent) => {
    beginInteraction(overlayId, 'move', startTime, endTime, e)
  }

  const beginTrim = (
    overlayId: string,
    edge: 'start' | 'end',
    startTime: number,
    endTime: number,
    e: React.PointerEvent,
  ) => {
    beginInteraction(overlayId, edge === 'start' ? 'trim-start' : 'trim-end', startTime, endTime, e)
  }

  return { beginMove, beginTrim, draft }
}
