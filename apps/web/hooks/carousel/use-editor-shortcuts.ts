'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/lib/carousel/store'

export function useEditorShortcuts(): void {
  const removeLayer = useEditorStore(s => s.removeLayer)
  const undo = useEditorStore(s => s.undo)
  const redo = useEditorStore(s => s.redo)
  const setActiveLayer = useEditorStore(s => s.setActiveLayer)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isEditable =
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'

      if (e.key === 'Escape') {
        setActiveLayer(null, null)
        target?.blur?.()
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
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

      if (isEditable) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const { activeSlideId, activeLayerId } = useEditorStore.getState()
        if (activeSlideId && activeLayerId) {
          e.preventDefault()
          removeLayer(activeSlideId, activeLayerId)
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [removeLayer, undo, redo, setActiveLayer])
}
