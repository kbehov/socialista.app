'use client'

import { templateReferencesToAttachedMedia } from '@/lib/studio/template-media'
import { commitHaptic } from '@/utils/haptics'
import type { AttachedMedia } from '@/components/files/attach-media/types'
import {
  StudioTemplateKind,
  type AspectRatio,
  type StudioTemplateDto,
} from '@socialista/types'
import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react'

type PromptHandlers = {
  insertAtCursor: (snippet: string) => void
  setPrompt: (text: string) => void
  setAttachments: (attachments: AttachedMedia[]) => void
  focusPrompt: () => void
  setModel?: (modelValue: string) => void
  setAspectRatio?: (ratio: AspectRatio) => void
}

type ImageStudioContextValue = {
  composerRef: React.RefObject<HTMLDivElement | null>
  insertSnippet: (snippet: string) => void
  setPrompt: (text: string) => void
  applyTemplate: (template: StudioTemplateDto) => void
  registerPromptHandlers: (handlers: PromptHandlers) => void
}

const ImageStudioContext = createContext<ImageStudioContextValue | null>(null)

export function ImageStudioProvider({ children }: { children: ReactNode }) {
  const composerRef = useRef<HTMLDivElement>(null)
  const handlersRef = useRef<PromptHandlers | null>(null)

  const registerPromptHandlers = useCallback((handlers: PromptHandlers) => {
    handlersRef.current = handlers
  }, [])

  const focusComposer = useCallback(() => {
    handlersRef.current?.focusPrompt()
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  const insertSnippet = useCallback(
    (snippet: string) => {
      handlersRef.current?.insertAtCursor(snippet)
      commitHaptic({ vibrateDuration: 8 })
      focusComposer()
    },
    [focusComposer],
  )

  const setPrompt = useCallback(
    (text: string) => {
      handlersRef.current?.setPrompt(text)
      commitHaptic({ vibrateDuration: 8 })
      focusComposer()
    },
    [focusComposer],
  )

  const applyTemplate = useCallback(
    (template: StudioTemplateDto) => {
      if (template.kind !== StudioTemplateKind.IMAGE) return
      const handlers = handlersRef.current
      const { payload } = template
      handlers?.setPrompt(payload?.prompt ?? '')
      handlers?.setAttachments(
        templateReferencesToAttachedMedia(template, payload?.referenceImageUrls ?? []),
      )
      if (payload?.model) handlers?.setModel?.(payload.model)
      if (payload?.aspectRatio) handlers?.setAspectRatio?.(payload.aspectRatio)
      commitHaptic({ vibrateDuration: 8 })
      focusComposer()
    },
    [focusComposer],
  )

  const value = useMemo(
    () => ({
      composerRef,
      insertSnippet,
      setPrompt,
      applyTemplate,
      registerPromptHandlers,
    }),
    [insertSnippet, setPrompt, applyTemplate, registerPromptHandlers],
  )

  return <ImageStudioContext.Provider value={value}>{children}</ImageStudioContext.Provider>
}

export function useImageStudio() {
  const context = useContext(ImageStudioContext)
  if (!context) {
    throw new Error('useImageStudio must be used within ImageStudioProvider')
  }
  return context
}

export function useOptionalImageStudio() {
  return useContext(ImageStudioContext)
}
