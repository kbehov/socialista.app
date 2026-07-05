'use client'

import { useEffect } from 'react'
import { useSlideImageEdit } from '@/components/carousel/slide-image-edit-provider'
import { useEditorStore } from '@/lib/carousel/store'

export function useEditorShortcuts(): void {
  const removeLayer = useEditorStore(s => s.removeLayer)
  const undo = useEditorStore(s => s.undo)
  const redo = useEditorStore(s => s.redo)
  const clearLayerSelection = useEditorStore(s => s.clearLayerSelection)
  const { deselectBackgroundEdit } = useSlideImageEdit()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const isEditable =
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'

      if (e.key === 'Escape') {
        deselectBackgroundEdit()
        clearLayerSelection()
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
  }, [deselectBackgroundEdit, removeLayer, undo, redo, clearLayerSelection])
}
