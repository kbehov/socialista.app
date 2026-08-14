'use client'

import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react'

type PromptHandlers = {
  insertAtCursor: (snippet: string) => void
  focusPrompt: () => void
}

type ImageStudioContextValue = {
  composerRef: React.RefObject<HTMLDivElement | null>
  insertSnippet: (snippet: string) => void
  registerPromptHandlers: (handlers: PromptHandlers) => void
}

const ImageStudioContext = createContext<ImageStudioContextValue | null>(null)

export function ImageStudioProvider({ children }: { children: ReactNode }) {
  const composerRef = useRef<HTMLDivElement>(null)
  const handlersRef = useRef<PromptHandlers | null>(null)

  const registerPromptHandlers = useCallback((handlers: PromptHandlers) => {
    handlersRef.current = handlers
  }, [])

  const insertSnippet = useCallback((snippet: string) => {
    handlersRef.current?.insertAtCursor(snippet)
    handlersRef.current?.focusPrompt()
    composerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [])

  const value = useMemo(
    () => ({
      composerRef,
      insertSnippet,
      registerPromptHandlers,
    }),
    [insertSnippet, registerPromptHandlers],
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
