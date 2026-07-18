'use client'

import { useEffect } from 'react'
import { useSlideImageEdit } from '@/components/carousel/slide-image-edit-provider'
import { useEditorStore } from '@/lib/carousel/store'

export function useEditorShortcuts(): void {
  const removeLayer = useEditorStore(s => s.removeLayer)
  const undo = useEditorStore(s => s.undo)
  const redo = useEditorStore(s => s.redo)
  const clearLayerSelection = useEditorStore(s => s.clearLayerSelection)
  const setActiveSlide = useEditorStore(s => s.setActiveSlide)
  const reorderSlides = useEditorStore(s => s.reorderSlides)
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

      // Keep native text undo/redo inside form fields and contenteditable
      if (isEditable) return

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

      const { slides, activeSlideId, activeLayerId } = useEditorStore.getState()
      const activeIndex = slides.findIndex(slide => slide.id === activeSlideId)

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (e.metaKey || e.ctrlKey) {
          if (activeIndex > 0 && activeSlideId) {
            e.preventDefault()
            const targetSlide = slides[activeIndex - 1]
            if (targetSlide) reorderSlides(activeSlideId, targetSlide.id)
          }
          return
        }
        if (activeIndex > 0) {
          e.preventDefault()
          const prev = slides[activeIndex - 1]
          if (prev) setActiveSlide(prev.id)
        }
        return
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (e.metaKey || e.ctrlKey) {
          if (activeIndex >= 0 && activeIndex < slides.length - 1 && activeSlideId) {
            e.preventDefault()
            const targetSlide = slides[activeIndex + 1]
            if (targetSlide) reorderSlides(activeSlideId, targetSlide.id)
          }
          return
        }
        if (activeIndex >= 0 && activeIndex < slides.length - 1) {
          e.preventDefault()
          const next = slides[activeIndex + 1]
          if (next) setActiveSlide(next.id)
        }
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (activeSlideId && activeLayerId) {
          e.preventDefault()
          removeLayer(activeSlideId, activeLayerId)
        }
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    clearLayerSelection,
    deselectBackgroundEdit,
    redo,
    removeLayer,
    reorderSlides,
    setActiveSlide,
    undo,
  ])
}
