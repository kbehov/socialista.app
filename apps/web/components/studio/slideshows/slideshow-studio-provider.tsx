'use client'

import { commitHaptic } from '@/utils/haptics'
import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react'

type PromptHandlers = {
  insertAtCursor: (snippet: string) => void
  setPrompt: (text: string) => void
  focusPrompt: () => void
}

type SlideshowStudioContextValue = {
  composerRef: React.RefObject<HTMLDivElement | null>
  insertSnippet: (snippet: string) => void
  setPrompt: (text: string) => void
  registerPromptHandlers: (handlers: PromptHandlers) => void
}

const SlideshowStudioContext = createContext<SlideshowStudioContextValue | null>(null)

export function SlideshowStudioProvider({ children }: { children: ReactNode }) {
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

  const value = useMemo(
    () => ({
      composerRef,
      insertSnippet,
      setPrompt,
      registerPromptHandlers,
    }),
    [insertSnippet, setPrompt, registerPromptHandlers],
  )

  return <SlideshowStudioContext.Provider value={value}>{children}</SlideshowStudioContext.Provider>
}

export function useSlideshowStudio() {
  const context = useContext(SlideshowStudioContext)
  if (!context) {
    throw new Error('useSlideshowStudio must be used within SlideshowStudioProvider')
  }
  return context
}
