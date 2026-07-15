'use client'

import type { AspectRatioId, ImageExample, VibeId } from '@/app/(app)/dashboard/studio/images/_lib/examples'
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

type ImageStudioContextValue = {
  selectedVibe: VibeId
  setSelectedVibe: (vibe: VibeId) => void
  activeExampleId: string | null
  setActiveExampleId: (id: string | null) => void
  composerRef: React.RefObject<HTMLDivElement | null>
  remixExample: (example: ImageExample) => void
  insertSnippet: (snippet: string) => void
  registerPromptHandlers: (handlers: {
    setPrompt: (text: string) => void
    setAspectRatio: (ratio: AspectRatioId) => void
    insertAtCursor: (snippet: string) => void
    focusPrompt: () => void
  }) => void
}

const ImageStudioContext = createContext<ImageStudioContextValue | null>(null)

export function ImageStudioProvider({ children }: { children: ReactNode }) {
  const [selectedVibe, setSelectedVibe] = useState<VibeId>('all')
  const [activeExampleId, setActiveExampleId] = useState<string | null>(null)
  const composerRef = useRef<HTMLDivElement>(null)
  const handlersRef = useRef<{
    setPrompt: (text: string) => void
    setAspectRatio: (ratio: AspectRatioId) => void
    insertAtCursor: (snippet: string) => void
    focusPrompt: () => void
  } | null>(null)

  const registerPromptHandlers = useCallback(
    (handlers: {
      setPrompt: (text: string) => void
      setAspectRatio: (ratio: AspectRatioId) => void
      insertAtCursor: (snippet: string) => void
      focusPrompt: () => void
    }) => {
      handlersRef.current = handlers
    },
    [],
  )

  const remixExample = useCallback((example: ImageExample) => {
    handlersRef.current?.setPrompt(example.prompt)
    handlersRef.current?.setAspectRatio(example.aspectRatio)
    handlersRef.current?.focusPrompt()
    setActiveExampleId(example.id)
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const insertSnippet = useCallback((snippet: string) => {
    handlersRef.current?.insertAtCursor(snippet)
    handlersRef.current?.focusPrompt()
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  const value = useMemo(
    () => ({
      selectedVibe,
      setSelectedVibe,
      activeExampleId,
      setActiveExampleId,
      composerRef,
      remixExample,
      insertSnippet,
      registerPromptHandlers,
    }),
    [selectedVibe, activeExampleId, remixExample, insertSnippet, registerPromptHandlers],
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
