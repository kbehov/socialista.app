'use client'

import { editImage } from '@/actions/fal.actions'
import { proxiedImageUrl } from '@/lib/carousel/image-url'
import { resolveFalImageUrl } from '@/lib/carousel/resolve-fal-image-url'
import { useEditorStore } from '@/lib/carousel/store'
import type { LayerId, SlideId } from '@socialista/types'
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { SlideImageEditDialog } from './slide-image-edit-dialog'

export type ImageEditTarget =
  | { kind: 'background'; slideId: SlideId; imageUrl: string }
  | { kind: 'layer'; slideId: SlideId; layerId: LayerId; imageUrl: string }

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
  openEditDialog: (target: ImageEditTarget) => void
  openAdjustMode: (slideId: SlideId, imageUrl: string) => void
  closeAdjustMode: () => void
  replaceImage: (target: ImageEditTarget) => void
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
  const setLayerImageUrl = useEditorStore(s => s.setLayerImageUrl)
  const clearSlideBackgroundImage = useEditorStore(s => s.clearSlideBackgroundImage)
  const activeSlideId = useEditorStore(s => s.activeSlideId)
  const activeLayerId = useEditorStore(s => s.activeLayerId)

  const [editingSlideIds, setEditingSlideIds] = useState<Set<SlideId>>(() => new Set())
  const [dialogTarget, setDialogTarget] = useState<ImageEditTarget | null>(null)
  const [adjustTarget, setAdjustTarget] = useState<AdjustTarget | null>(null)
  const [backgroundEditSlideId, setBackgroundEditSlideId] = useState<SlideId | null>(null)
  const replaceTargetRef = useRef<ImageEditTarget | null>(null)
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

  const openEditDialog = useCallback((target: ImageEditTarget) => {
    if (!target.imageUrl) {
      toast.error('Add an image first')
      return
    }
    setAdjustTarget(null)
    setBackgroundEditSlideId(null)
    setDialogTarget(target)
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

  const replaceImage = useCallback((target: ImageEditTarget) => {
    replaceTargetRef.current = target
    fileInputRef.current?.click()
  }, [])

  const replaceSlideImage = useCallback(
    (slideId: SlideId) => {
      const slide = useEditorStore.getState().slides.find(s => s.id === slideId)
      replaceImage({ kind: 'background', slideId, imageUrl: slide?.backgroundImageUrl ?? '' })
    },
    [replaceImage],
  )

  const removeSlideImage = useCallback(
    (slideId: SlideId) => {
      clearSlideBackgroundImage(slideId)
      setBackgroundEditSlideId(current => (current === slideId ? null : current))
    },
    [clearSlideBackgroundImage],
  )

  const applyEditedImage = useCallback(
    (target: ImageEditTarget, url: string) => {
      const proxied = proxiedImageUrl(url)
      if (target.kind === 'background') {
        setSlideBackground(target.slideId, proxied)
        toast.success('Background image updated')
        return
      }
      setLayerImageUrl(target.slideId, target.layerId, proxied)
      toast.success('Image layer updated')
    },
    [setLayerImageUrl, setSlideBackground],
  )

  const runEdit = useCallback(
    async (prompt: string) => {
      if (!dialogTarget) return

      const target = dialogTarget
      setDialogTarget(null)
      setEditing(target.slideId, true)

      try {
        const falImageUrl = await resolveFalImageUrl(target.imageUrl)
        const result = await editImage(prompt, falImageUrl)

        if (!result.success) {
          toast.error(result.error)
          return
        }

        applyEditedImage(target, result.data.url)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to edit image')
      } finally {
        setEditing(target.slideId, false)
      }
    },
    [applyEditedImage, dialogTarget, setEditing],
  )

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const target = replaceTargetRef.current
      const file = event.target.files?.[0]
      event.target.value = ''

      if (!target || !file) return

      const url = URL.createObjectURL(file)
      if (target.kind === 'background') {
        setSlideBackground(target.slideId, url)
      } else {
        setLayerImageUrl(target.slideId, target.layerId, url)
      }
      replaceTargetRef.current = null
    },
    [setLayerImageUrl, setSlideBackground],
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
      replaceImage,
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
      replaceImage,
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
