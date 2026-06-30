'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { SlideId } from '@socialista/types'
import { toast } from 'sonner'
import { editImage } from '@/actions/fal.actions'
import { proxiedImageUrl } from '@/lib/carousel/image-url'
import { resolveFalImageUrl } from '@/lib/carousel/resolve-fal-image-url'
import { useEditorStore } from '@/lib/carousel/store'
import { SlideImageEditDialog } from './slide-image-edit-dialog'

type EditTarget = {
  slideId: SlideId
  imageUrl: string
}

type SlideImageEditContextValue = {
  editingSlideIds: ReadonlySet<SlideId>
  isEditingSlide: (slideId: SlideId) => boolean
  openEditDialog: (slideId: SlideId, imageUrl: string) => void
  replaceSlideImage: (slideId: SlideId) => void
  removeSlideImage: (slideId: SlideId) => void
}

const SlideImageEditContext = createContext<SlideImageEditContextValue | null>(null)

export function useSlideImageEdit(): SlideImageEditContextValue {
  const context = useContext(SlideImageEditContext)
  if (!context) {
    throw new Error('useSlideImageEdit must be used within SlideImageEditProvider')
  }
  return context
}

export function SlideImageEditProvider({ children }: { children: ReactNode }) {
  const setSlideBackground = useEditorStore(s => s.setSlideBackground)
  const clearSlideBackgroundImage = useEditorStore(s => s.clearSlideBackgroundImage)

  const [editingSlideIds, setEditingSlideIds] = useState<Set<SlideId>>(() => new Set())
  const [dialogTarget, setDialogTarget] = useState<EditTarget | null>(null)
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

  const openEditDialog = useCallback((slideId: SlideId, imageUrl: string) => {
    if (!imageUrl) {
      toast.error('Add a background image first')
      return
    }
    setDialogTarget({ slideId, imageUrl })
  }, [])

  const replaceSlideImage = useCallback((slideId: SlideId) => {
    replaceTargetRef.current = slideId
    fileInputRef.current?.click()
  }, [])

  const removeSlideImage = useCallback(
    (slideId: SlideId) => {
      clearSlideBackgroundImage(slideId)
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
      openEditDialog,
      replaceSlideImage,
      removeSlideImage,
    }),
    [editingSlideIds, openEditDialog, replaceSlideImage, removeSlideImage],
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
