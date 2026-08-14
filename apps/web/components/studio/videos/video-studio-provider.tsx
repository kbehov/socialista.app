'use client'

import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react'

type PromptHandlers = {
  insertAtCursor: (snippet: string) => void
  focusPrompt: () => void
}

type VideoStudioContextValue = {
  composerRef: React.RefObject<HTMLDivElement | null>
  insertSnippet: (snippet: string) => void
  registerPromptHandlers: (handlers: PromptHandlers) => void
}

const VideoStudioContext = createContext<VideoStudioContextValue | null>(null)

export function VideoStudioProvider({ children }: { children: ReactNode }) {
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

  return <VideoStudioContext.Provider value={value}>{children}</VideoStudioContext.Provider>
}

export function useVideoStudio() {
  const context = useContext(VideoStudioContext)
  if (!context) {
    throw new Error('useVideoStudio must be used within VideoStudioProvider')
  }
  return context
}
