'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { collectClipSnapTargets, snapTime } from '@/lib/video/snap'
import { useVideoEditorStore } from '@/lib/video/store'
import type { ClipId } from '@socialista/types'

type Edge = 'in' | 'out'

type TrimState = {
  clipId: ClipId
  edge: Edge
  startPointerX: number
  startTrimIn: number
  startTrimOut: number
  startDuration: number
  startTime: number
  pxPerSec: number
}

const MIN_DURATION = 0.1

/** Hook for trimming a clip via the in/out edge handles. */
export function useTrimHandles(pxPerSec: number) {
  const [draft, setDraft] = useState<{ clipId: ClipId; trimIn: number; trimOut: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const stateRef = useRef<TrimState | null>(null)
  const draftRef = useRef<{ clipId: ClipId; trimIn: number; trimOut: number } | null>(null)
  const trimClip = useVideoEditorStore(s => s.trimClip)
  const setSnapGuideTime = useVideoEditorStore(s => s.setSnapGuideTime)

  const onMove = useCallback(
    (e: PointerEvent) => {
      const it = stateRef.current
      if (!it) return
      e.preventDefault()
      const rawDeltaSec = (e.clientX - it.startPointerX) / it.pxPerSec
      const state = useVideoEditorStore.getState()
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

      let next: { clipId: ClipId; trimIn: number; trimOut: number }

      if (it.edge === 'in') {
        const edgeTime = it.startTime + rawDeltaSec
        const snapped = snapTime(edgeTime, candidates, it.pxPerSec, state.snapEnabled)
        setSnapGuideTime(snapped.guideTime)
        const deltaFromStart = snapped.time - it.startTime
        const newTrimIn = Math.max(0, it.startTrimIn + deltaFromStart)
        const maxTrimIn = it.startTrimIn + it.startDuration - MIN_DURATION
        next = {
          clipId: it.clipId,
          trimIn: Math.min(newTrimIn, maxTrimIn),
          trimOut: it.startTrimOut,
        }
      } else {
        const edgeTime = it.startTime + it.startDuration + rawDeltaSec
        const snapped = snapTime(edgeTime, candidates, it.pxPerSec, state.snapEnabled)
        setSnapGuideTime(snapped.guideTime)
        const newDuration = snapped.time - it.startTime
        const delta = it.startDuration - newDuration
        const newTrimOut = Math.max(0, it.startTrimOut + delta)
        const maxTrimOut = it.startTrimOut + it.startDuration - MIN_DURATION
        next = {
          clipId: it.clipId,
          trimIn: it.startTrimIn,
          trimOut: Math.min(newTrimOut, maxTrimOut),
        }
      }

      draftRef.current = next
      setDraft(next)
    },
    [setSnapGuideTime],
  )

  const stop = useCallback(() => {
    const it = stateRef.current
    const finalDraft = draftRef.current
    setSnapGuideTime(null)
    if (it && finalDraft) {
      trimClip(it.clipId, finalDraft.trimIn, finalDraft.trimOut)
    }
    stateRef.current = null
    draftRef.current = null
    setDraft(null)
    setIsDragging(false)
  }, [setSnapGuideTime, trimClip])

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

  const beginTrim = (
    clipId: ClipId,
    edge: Edge,
    trimIn: number,
    trimOut: number,
    duration: number,
    e: React.PointerEvent,
    startTime = 0,
  ) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    const clip = useVideoEditorStore.getState().project.clips[clipId]
    stateRef.current = {
      clipId,
      edge,
      startPointerX: e.clientX,
      startTrimIn: trimIn,
      startTrimOut: trimOut,
      startDuration: duration,
      startTime: startTime || clip?.startTime || 0,
      pxPerSec,
    }
    const initial = { clipId, trimIn, trimOut }
    draftRef.current = initial
    setDraft(initial)
    setIsDragging(true)
  }

  return { beginTrim, draft, isDragging }
}
