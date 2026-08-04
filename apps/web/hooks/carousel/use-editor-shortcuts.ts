'use client'

import { useEffect, useRef } from 'react'
import { useSlideImageEdit } from '@/components/carousel/slide-image-edit-provider'
import { useEditorStore } from '@/lib/carousel/store'

type EditorShortcutOptions = {
  onSave?: () => void
  onPreview?: () => void
}

export function useEditorShortcuts(options: EditorShortcutOptions = {}): void {
  const removeLayer = useEditorStore(s => s.removeLayer)
  const undo = useEditorStore(s => s.undo)
  const redo = useEditorStore(s => s.redo)
  const clearLayerSelection = useEditorStore(s => s.clearLayerSelection)
  const setActiveSlide = useEditorStore(s => s.setActiveSlide)
  const reorderSlides = useEditorStore(s => s.reorderSlides)
  const duplicateLayer = useEditorStore(s => s.duplicateLayer)
  const duplicateSlide = useEditorStore(s => s.duplicateSlide)
  const bringForward = useEditorStore(s => s.bringForward)
  const sendBackward = useEditorStore(s => s.sendBackward)
  const updateLayer = useEditorStore(s => s.updateLayer)
  const { deselectBackgroundEdit } = useSlideImageEdit()

  const onSaveRef = useRef(options.onSave)
  const onPreviewRef = useRef(options.onPreview)

  useEffect(() => {
    onSaveRef.current = options.onSave
    onPreviewRef.current = options.onPreview
  }, [options.onPreview, options.onSave])

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

      const meta = e.metaKey || e.ctrlKey
      const key = e.key.toLowerCase()

      if (meta && key === 's') {
        e.preventDefault()
        onSaveRef.current?.()
        return
      }

      if (meta && e.shiftKey && key === 'p') {
        e.preventDefault()
        onPreviewRef.current?.()
        return
      }

      if (isEditable) return

      if (meta && key === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }

      if (meta && key === 'y') {
        e.preventDefault()
        redo()
        return
      }

      const { slides, activeSlideId, activeLayerId, canvas } = useEditorStore.getState()
      const activeIndex = slides.findIndex(slide => slide.id === activeSlideId)
      const activeSlide = slides.find(slide => slide.id === activeSlideId)
      const activeLayer = activeSlide?.layers.find(layer => layer.id === activeLayerId)

      if (meta && key === 'd') {
        e.preventDefault()
        if (activeSlideId && activeLayerId) {
          duplicateLayer(activeSlideId, activeLayerId)
        } else if (activeSlideId) {
          duplicateSlide(activeSlideId)
        }
        return
      }

      if (meta && (e.key === '[' || e.key === ']')) {
        if (!activeSlideId || !activeLayerId) return
        e.preventDefault()
        if (e.key === ']') bringForward(activeSlideId, activeLayerId)
        else sendBackward(activeSlideId, activeLayerId)
        return
      }

      if (
        activeSlideId &&
        activeLayer &&
        (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') &&
        !meta
      ) {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const dxPct = (step / Math.max(1, canvas.width)) * 100
        const dyPct = (step / Math.max(1, canvas.height)) * 100
        const next = { x: activeLayer.x, y: activeLayer.y }
        if (e.key === 'ArrowLeft') next.x -= dxPct
        if (e.key === 'ArrowRight') next.x += dxPct
        if (e.key === 'ArrowUp') next.y -= dyPct
        if (e.key === 'ArrowDown') next.y += dyPct
        updateLayer(activeSlideId, activeLayer.id, next)
        return
      }

      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (meta) {
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
        if (meta) {
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
    bringForward,
    clearLayerSelection,
    deselectBackgroundEdit,
    duplicateLayer,
    duplicateSlide,
    redo,
    removeLayer,
    reorderSlides,
    sendBackward,
    setActiveSlide,
    undo,
    updateLayer,
  ])
}
