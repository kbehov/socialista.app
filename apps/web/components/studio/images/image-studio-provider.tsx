'use client'

import { presetToAttachedMedia } from '@/lib/studio/preset-media'
import { commitHaptic } from '@/utils/haptics'
import type { AttachedMedia } from '@/components/files/attach-media/types'
import type { Preset } from '@socialista/types'
import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react'

type PromptHandlers = {
  insertAtCursor: (snippet: string) => void
  setPrompt: (text: string) => void
  setAttachments: (attachments: AttachedMedia[]) => void
  focusPrompt: () => void
}

type ImageStudioContextValue = {
  composerRef: React.RefObject<HTMLDivElement | null>
  insertSnippet: (snippet: string) => void
  setPrompt: (text: string) => void
  applyPreset: (preset: Preset) => void
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

  const applyPreset = useCallback(
    (preset: Preset) => {
      handlersRef.current?.setPrompt(preset.prompt)
      handlersRef.current?.setAttachments(presetToAttachedMedia(preset))
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
      applyPreset,
      registerPromptHandlers,
    }),
    [insertSnippet, setPrompt, applyPreset, registerPromptHandlers],
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
