'use client'

import { useEffect } from 'react'
import { measureOverlayHeightPct } from '@/lib/video/overlay-bounds'
import { useVideoEditorStore } from '@/lib/video/store'

export function useVideoShortcuts(): void {
  const undo = useVideoEditorStore(s => s.undo)
  const redo = useVideoEditorStore(s => s.redo)
  const play = useVideoEditorStore(s => s.play)
  const pause = useVideoEditorStore(s => s.pause)
  const seek = useVideoEditorStore(s => s.seek)
  const splitClip = useVideoEditorStore(s => s.splitClip)
  const splitOverlay = useVideoEditorStore(s => s.splitOverlay)
  const removeClip = useVideoEditorStore(s => s.removeClip)
  const removeOverlay = useVideoEditorStore(s => s.removeOverlay)
  const duplicateClip = useVideoEditorStore(s => s.duplicateClip)
  const duplicateOverlay = useVideoEditorStore(s => s.duplicateOverlay)
  const selectClip = useVideoEditorStore(s => s.selectClip)
  const selectOverlay = useVideoEditorStore(s => s.selectOverlay)
  const zoomIn = useVideoEditorStore(s => s.zoomIn)
  const zoomOut = useVideoEditorStore(s => s.zoomOut)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isEditable =
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'

      // Undo/redo work even from within editable inputs (Cmd/Ctrl+Z) — let those happen
      if ((e.metaKey || e.ctrlKey) && !e.altKey && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
        return
      }

      // Duplicate
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'd') {
        if (isEditable) return
        e.preventDefault()
        const state = useVideoEditorStore.getState()
        if (state.selectedClipId) duplicateClip(state.selectedClipId)
        else if (state.selectedOverlayId) duplicateOverlay(state.selectedOverlayId)
        return
      }

      if (e.key === 'Escape') {
        selectClip(null)
        selectOverlay(null)
        target?.blur?.()
        return
      }

      if (isEditable) return

      if (e.key === ' ') {
        e.preventDefault()
        const state = useVideoEditorStore.getState()
        if (state.isPlaying) pause()
        else play()
        return
      }

      // J/K/L shuttle — industry-standard playback keys
      if (e.key.toLowerCase() === 'j') {
        e.preventDefault()
        const state = useVideoEditorStore.getState()
        pause()
        seek(Math.max(0, state.playhead - 1))
        return
      }

      if (e.key.toLowerCase() === 'k') {
        e.preventDefault()
        pause()
        return
      }

      if (e.key.toLowerCase() === 'l') {
        e.preventDefault()
        const state = useVideoEditorStore.getState()
        if (!state.isPlaying) {
          play()
        } else {
          // Already playing: nudge forward (repeat L ≈ 2× feel without rate plumbing)
          seek(Math.min(state.project.duration, state.playhead + 1))
        }
        return
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const state = useVideoEditorStore.getState()
        const step = e.shiftKey ? 1 : 1 / Math.max(1, state.project.fps)
        seek(Math.max(0, state.playhead - step))
        return
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        const state = useVideoEditorStore.getState()
        const step = e.shiftKey ? 1 : 1 / Math.max(1, state.project.fps)
        seek(Math.min(state.project.duration, state.playhead + step))
        return
      }

      if (e.key.toLowerCase() === 's') {
        e.preventDefault()
        const state = useVideoEditorStore.getState()
        if (state.selectedClipId) {
          splitClip(state.selectedClipId, state.playhead)
        } else if (state.selectedOverlayId) {
          splitOverlay(state.selectedOverlayId, state.playhead)
        }
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const state = useVideoEditorStore.getState()
        if (state.selectedClipId) {
          e.preventDefault()
          removeClip(state.selectedClipId)
        } else if (state.selectedOverlayId) {
          e.preventDefault()
          removeOverlay(state.selectedOverlayId)
        }
        return
      }

      if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        zoomIn()
        return
      }

      if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        zoomOut()
        return
      }

      // Canvas alignment: H = horizontal center, V = vertical center
      if (e.key.toLowerCase() === 'h' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        const state = useVideoEditorStore.getState()
        if (state.selectedOverlayId) {
          const artboard = document.querySelector('[data-video-canvas]') as HTMLElement | null
          const heightPct = measureOverlayHeightPct(artboard, state.selectedOverlayId) ?? undefined
          state.alignOverlayCenter(state.selectedOverlayId, 'horizontal', heightPct)
        } else if (state.selectedClipId) state.centerClipOnCanvas(state.selectedClipId, 'horizontal')
        return
      }

      if (e.key.toLowerCase() === 'v' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        const state = useVideoEditorStore.getState()
        if (state.selectedOverlayId) {
          const artboard = document.querySelector('[data-video-canvas]') as HTMLElement | null
          const heightPct = measureOverlayHeightPct(artboard, state.selectedOverlayId) ?? undefined
          state.alignOverlayCenter(state.selectedOverlayId, 'vertical', heightPct)
        } else if (state.selectedClipId) state.centerClipOnCanvas(state.selectedClipId, 'vertical')
        return
      }

      // Cmd+R toggle rulers
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'r') {
        e.preventDefault()
        useVideoEditorStore.getState().toggleShowRulers()
        return
      }

      // Cmd+; toggle guides
      if ((e.metaKey || e.ctrlKey) && e.key === ';') {
        e.preventDefault()
        useVideoEditorStore.getState().toggleShowGuides()
        return
      }

      // Shift+Cmd+G toggle canvas snap
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'g') {
        e.preventDefault()
        useVideoEditorStore.getState().toggleCanvasSnapEnabled()
        return
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    duplicateClip,
    duplicateOverlay,
    pause,
    play,
    redo,
    removeClip,
    removeOverlay,
    seek,
    selectClip,
    selectOverlay,
    splitClip,
    splitOverlay,
    undo,
    zoomIn,
    zoomOut,
  ])
}
