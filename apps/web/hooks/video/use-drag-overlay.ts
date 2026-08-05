'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { collectOverlaySnapTargets, snapTime } from '@/lib/video/snap'
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
const TAP_THRESHOLD_PX = 5

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
  const onTapRef = useRef<(() => void) | null>(null)
  const setOverlayTiming = useVideoEditorStore(s => s.setOverlayTiming)
  const setSnapGuideTime = useVideoEditorStore(s => s.setSnapGuideTime)

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
      const state = useVideoEditorStore.getState()
      const candidates = collectOverlaySnapTargets({
        playhead: state.playhead,
        duration: state.project.duration,
        overlays: state.project.textOverlays,
        clips: Object.values(state.project.clips).map(c => ({
          startTime: c.startTime,
          duration: c.duration,
        })),
        excludeOverlayId: it.overlayId,
      })

      if (it.mode === 'move') {
        const duration = it.startEndTime - it.startStartTime
        const rawStart = Math.max(0, it.startStartTime + deltaSec)
        const withEnd = [...candidates]
        for (const t of candidates) {
          withEnd.push(t - duration)
        }
        const snapped = snapTime(rawStart, withEnd, it.pxPerSec, state.snapEnabled)
        setSnapGuideTime(snapped.guideTime)
        applyDraft({
          overlayId: it.overlayId,
          startTime: snapped.time,
          endTime: snapped.time + duration,
        })
        return
      }

      if (it.mode === 'trim-start') {
        const rawStart = Math.max(0, Math.min(it.startEndTime - MIN_DURATION, it.startStartTime + deltaSec))
        const snapped = snapTime(rawStart, candidates, it.pxPerSec, state.snapEnabled)
        setSnapGuideTime(snapped.guideTime)
        const newStart = Math.max(0, Math.min(it.startEndTime - MIN_DURATION, snapped.time))
        applyDraft({
          overlayId: it.overlayId,
          startTime: newStart,
          endTime: it.startEndTime,
        })
        return
      }

      const rawEnd = Math.max(it.startStartTime + MIN_DURATION, it.startEndTime + deltaSec)
      const snapped = snapTime(rawEnd, candidates, it.pxPerSec, state.snapEnabled)
      setSnapGuideTime(snapped.guideTime)
      const newEnd = Math.max(it.startStartTime + MIN_DURATION, snapped.time)
      applyDraft({
        overlayId: it.overlayId,
        startTime: it.startStartTime,
        endTime: newEnd,
      })
    },
    [applyDraft, setSnapGuideTime],
  )

  const stop = useCallback(() => {
    const it = stateRef.current
    const finalDraft = draftRef.current
    const onTap = onTapRef.current
    setSnapGuideTime(null)
    if (it && finalDraft) {
      const moved =
        it.mode === 'move'
          ? Math.abs(finalDraft.startTime - it.startStartTime) * it.pxPerSec > TAP_THRESHOLD_PX
          : it.mode === 'trim-start'
            ? Math.abs(finalDraft.startTime - it.startStartTime) * it.pxPerSec > TAP_THRESHOLD_PX
            : Math.abs(finalDraft.endTime - it.startEndTime) * it.pxPerSec > TAP_THRESHOLD_PX

      if (!moved && it.mode === 'move' && onTap) {
        onTap()
      } else if (moved) {
        setOverlayTiming(finalDraft.overlayId, finalDraft.startTime, finalDraft.endTime)
      }
    }
    stateRef.current = null
    draftRef.current = null
    onTapRef.current = null
    setDraft(null)
    setIsDragging(false)
  }, [setOverlayTiming, setSnapGuideTime])

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

  const beginMove = (
    overlayId: string,
    startTime: number,
    endTime: number,
    e: React.PointerEvent,
    onTap?: () => void,
  ) => {
    onTapRef.current = onTap ?? null
    beginInteraction(overlayId, 'move', startTime, endTime, e)
  }

  const beginTrim = (
    overlayId: string,
    edge: 'start' | 'end',
    startTime: number,
    endTime: number,
    e: React.PointerEvent,
  ) => {
    onTapRef.current = null
    beginInteraction(overlayId, edge === 'start' ? 'trim-start' : 'trim-end', startTime, endTime, e)
  }

  return { beginMove, beginTrim, draft }
}
