'use client'

import { editImage } from '@/actions/fal.actions'
import { proxiedImageUrl } from '@/lib/carousel/image-url'
import { resolveFalImageUrl } from '@/lib/carousel/resolve-fal-image-url'
import { useEditorStore } from '@/lib/carousel/store'
import type { SlideId } from '@socialista/types'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { SlideImageEditDialog } from './slide-image-edit-dialog'

type EditTarget = {
  slideId: SlideId
  imageUrl: string
}

type AdjustTarget = {
  slideId: SlideId
  imageUrl: string
}

type SlideImageEditContextValue = {
  editingSlideIds: ReadonlySet<SlideId>
  isEditingSlide: (slideId: SlideId) => boolean
  adjustTarget: AdjustTarget | null
  isAdjustingSlide: (slideId: SlideId) => boolean
  isBackgroundEditSelected: (slideId: SlideId) => boolean
  selectBackgroundEdit: (slideId: SlideId) => void
  deselectBackgroundEdit: () => void
  openEditDialog: (slideId: SlideId, imageUrl: string) => void
  openAdjustMode: (slideId: SlideId, imageUrl: string) => void
  closeAdjustMode: () => void
  replaceSlideImage: (slideId: SlideId) => void
  removeSlideImage: (slideId: SlideId) => void
}

const SlideImageEditContext = createContext<SlideImageEditContextValue | null>(null)

export function useSlideImageEditOptional(): SlideImageEditContextValue | null {
  return useContext(SlideImageEditContext)
}

export function useSlideImageEdit(): SlideImageEditContextValue {
  const context = useSlideImageEditOptional()
  if (!context) {
    throw new Error('useSlideImageEdit must be used within SlideImageEditProvider')
  }
  return context
}

export function SlideImageEditProvider({ children }: { children: ReactNode }) {
  const setSlideBackground = useEditorStore(s => s.setSlideBackground)
  const clearSlideBackgroundImage = useEditorStore(s => s.clearSlideBackgroundImage)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const activeLayerId = useEditorStore(s => s.activeLayerId)

  const [editingSlideIds, setEditingSlideIds] = useState<Set<SlideId>>(() => new Set())
  const [dialogTarget, setDialogTarget] = useState<EditTarget | null>(null)
  const [adjustTarget, setAdjustTarget] = useState<AdjustTarget | null>(null)
  const [backgroundEditSlideId, setBackgroundEditSlideId] = useState<SlideId | null>(null)
  const replaceTargetRef = useRef<SlideId | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const setEditing = useCallback((slideId: SlideId, editing: boolean) => {
    setEditingSlideIds(prev => {
      const next = new Set(prev)
      if (editing) next.add(slideId)
      else next.delete(slideId)
      return next
    })
  }, [])

  const deselectBackgroundEdit = useCallback(() => {
    setBackgroundEditSlideId(null)
  }, [])

  const selectBackgroundEdit = useCallback((slideId: SlideId) => {
    setBackgroundEditSlideId(slideId)
  }, [])

  useEffect(() => {
    if (activeLayerId) {
      setTimeout(() => {
        setBackgroundEditSlideId(null)
      }, 0)
    }
  }, [activeLayerId])

  const openEditDialog = useCallback((slideId: SlideId, imageUrl: string) => {
    if (!imageUrl) {
      toast.error('Add a background image first')
      return
    }
    setAdjustTarget(null)
    setBackgroundEditSlideId(null)
    setDialogTarget({ slideId, imageUrl })
  }, [])

  const openAdjustMode = useCallback((slideId: SlideId, imageUrl: string) => {
    if (!imageUrl) {
      toast.error('Add a background image first')
      return
    }
    setDialogTarget(null)
    setBackgroundEditSlideId(null)
    setAdjustTarget({ slideId, imageUrl })
  }, [])

  const closeAdjustMode = useCallback(() => {
    setAdjustTarget(null)
  }, [])

  const activeAdjustTarget = adjustTarget && adjustTarget.slideId === activeSlideId ? adjustTarget : null

  const activeBackgroundEditSlideId =
    backgroundEditSlideId && backgroundEditSlideId === activeSlideId ? backgroundEditSlideId : null

  const replaceSlideImage = useCallback((slideId: SlideId) => {
    replaceTargetRef.current = slideId
    fileInputRef.current?.click()
  }, [])

  const removeSlideImage = useCallback(
    (slideId: SlideId) => {
      clearSlideBackgroundImage(slideId)
      setBackgroundEditSlideId(current => (current === slideId ? null : current))
    },
    [clearSlideBackgroundImage],
  )

  const runEdit = useCallback(
    async (prompt: string) => {
      if (!dialogTarget) return

      const { slideId, imageUrl } = dialogTarget
      setDialogTarget(null)
      setEditing(slideId, true)

      try {
        const falImageUrl = await resolveFalImageUrl(imageUrl)
        const result = await editImage(prompt, falImageUrl)

        if (!result.success) {
          toast.error(result.error)
          return
        }

        setSlideBackground(slideId, proxiedImageUrl(result.data.url))
        toast.success('Background image updated')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to edit image')
      } finally {
        setEditing(slideId, false)
      }
    },
    [dialogTarget, setEditing, setSlideBackground],
  )

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const slideId = replaceTargetRef.current
      const file = event.target.files?.[0]
      event.target.value = ''

      if (!slideId || !file) return
      setSlideBackground(slideId, URL.createObjectURL(file))
      replaceTargetRef.current = null
    },
    [setSlideBackground],
  )

  const value = useMemo<SlideImageEditContextValue>(
    () => ({
      editingSlideIds,
      isEditingSlide: slideId => editingSlideIds.has(slideId),
      adjustTarget: activeAdjustTarget,
      isAdjustingSlide: slideId => activeAdjustTarget?.slideId === slideId,
      isBackgroundEditSelected: slideId => activeBackgroundEditSlideId === slideId,
      selectBackgroundEdit,
      deselectBackgroundEdit,
      openEditDialog,
      openAdjustMode,
      closeAdjustMode,
      replaceSlideImage,
      removeSlideImage,
    }),
    [
      activeAdjustTarget,
      activeBackgroundEditSlideId,
      closeAdjustMode,
      deselectBackgroundEdit,
      editingSlideIds,
      openAdjustMode,
      openEditDialog,
      replaceSlideImage,
      removeSlideImage,
      selectBackgroundEdit,
    ],
  )

  return (
    <SlideImageEditContext.Provider value={value}>
      {children}
      <SlideImageEditDialog
        open={dialogTarget !== null}
        onOpenChange={open => {
          if (!open) setDialogTarget(null)
        }}
        onSubmit={runEdit}
      />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
    </SlideImageEditContext.Provider>
  )
}
