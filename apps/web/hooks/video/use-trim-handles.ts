'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
  pxPerSec: number
}

/** Hook for trimming a clip via the in/out edge handles. */
export function useTrimHandles(pxPerSec: number) {
  const [draft, setDraft] = useState<{ clipId: ClipId; trimIn: number; trimOut: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const stateRef = useRef<TrimState | null>(null)
  const draftRef = useRef<{ clipId: ClipId; trimIn: number; trimOut: number } | null>(null)
  const trimClip = useVideoEditorStore(s => s.trimClip)

  const onMove = useCallback((e: PointerEvent) => {
    const it = stateRef.current
    if (!it) return
    e.preventDefault()
    const deltaSec = (e.clientX - it.startPointerX) / it.pxPerSec
    let next: { clipId: ClipId; trimIn: number; trimOut: number }
    if (it.edge === 'in') {
      const newTrimIn = Math.max(0, it.startTrimIn + deltaSec)
      const maxTrimIn = it.startTrimIn + it.startDuration - 0.1
      next = { clipId: it.clipId, trimIn: Math.min(newTrimIn, maxTrimIn), trimOut: it.startTrimOut }
    } else {
      const newTrimOut = Math.max(0, it.startTrimOut - deltaSec)
      const maxTrimOut = it.startTrimOut + it.startDuration - 0.1
      next = { clipId: it.clipId, trimIn: it.startTrimIn, trimOut: Math.min(newTrimOut, maxTrimOut) }
    }
    draftRef.current = next
    setDraft(next)
  }, [])

  const stop = useCallback(() => {
    const it = stateRef.current
    const finalDraft = draftRef.current
    if (it && finalDraft) {
      trimClip(it.clipId, finalDraft.trimIn, finalDraft.trimOut)
    }
    stateRef.current = null
    draftRef.current = null
    setDraft(null)
    setIsDragging(false)
  }, [trimClip])

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

  const beginTrim = (clipId: ClipId, edge: Edge, trimIn: number, trimOut: number, duration: number, e: React.PointerEvent) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    stateRef.current = {
      clipId,
      edge,
      startPointerX: e.clientX,
      startTrimIn: trimIn,
      startTrimOut: trimOut,
      startDuration: duration,
      pxPerSec,
    }
    const initial = { clipId, trimIn, trimOut }
    draftRef.current = initial
    setDraft(initial)
    setIsDragging(true)
  }

  return { beginTrim, draft }
}
