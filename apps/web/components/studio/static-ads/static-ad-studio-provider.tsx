'use client'

import { DEFAULT_AD_LANGUAGE } from '@/components/ui/language-selector'
import type { StaticAdFormatPreset } from '@/lib/studio/static-ads/format-presets'
import { STATIC_AD_RECREATE_PROMPT } from '@/lib/studio/static-ads/recreate-prompt'
import { type StaticAdAspectRatio } from '@/types/static-ads.types'
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

type PromptHandlers = {
  setPrompt: (text: string) => void
  getPrompt: () => string
  setAspectRatio: (ratio: StaticAdAspectRatio) => void
  insertAtCursor: (snippet: string) => void
  focusPrompt: () => void
}

export type StaticAdTemplateReference = {
  imageUrl: string
  name?: string
}

type StaticAdStudioContextValue = {
  aspectRatio: StaticAdAspectRatio
  setAspectRatio: (ratio: StaticAdAspectRatio) => void
  language: string
  setLanguage: (language: string) => void
  activePresetId: string | null
  clearActivePreset: () => void
  composerRef: React.RefObject<HTMLDivElement | null>
  applyFormatPreset: (preset: StaticAdFormatPreset) => void
  insertSnippet: (snippet: string) => void
  registerPromptHandlers: (handlers: PromptHandlers) => void
  templateReference: StaticAdTemplateReference | null
  applyTemplate: (template: StaticAdTemplateReference) => void
  clearTemplateReference: () => void
}

const StaticAdStudioContext = createContext<StaticAdStudioContextValue | null>(null)

export function StaticAdStudioProvider({ children }: { children: ReactNode }) {
  const [aspectRatio, setAspectRatio] = useState<StaticAdAspectRatio>('1:1')
  const [language, setLanguage] = useState(DEFAULT_AD_LANGUAGE)
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const [templateReference, setTemplateReference] = useState<StaticAdTemplateReference | null>(null)
  const composerRef = useRef<HTMLDivElement>(null)
  const handlersRef = useRef<PromptHandlers | null>(null)

  const registerPromptHandlers = useCallback((handlers: PromptHandlers) => {
    handlersRef.current = handlers
  }, [])

  const clearActivePreset = useCallback(() => {
    setActivePresetId(null)
  }, [])

  const clearTemplateReference = useCallback(() => {
    setTemplateReference(null)
  }, [])

  const scrollComposerIntoView = useCallback((block: ScrollLogicalPosition = 'nearest') => {
    const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    composerRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block,
    })
  }, [])

  const applyFormatPreset = useCallback(
    (preset: StaticAdFormatPreset) => {
      handlersRef.current?.setPrompt(preset.prompt)
      handlersRef.current?.setAspectRatio(preset.aspectRatio)
      handlersRef.current?.focusPrompt()
      setAspectRatio(preset.aspectRatio)
      setActivePresetId(preset.id)
      scrollComposerIntoView('nearest')
    },
    [scrollComposerIntoView],
  )

  const insertSnippet = useCallback(
    (snippet: string) => {
      handlersRef.current?.insertAtCursor(snippet)
      handlersRef.current?.focusPrompt()
      setActivePresetId(null)
      scrollComposerIntoView('nearest')
    },
    [scrollComposerIntoView],
  )

  const applyTemplate = useCallback(
    (template: StaticAdTemplateReference) => {
      setTemplateReference(template)
      const current = handlersRef.current?.getPrompt() ?? ''
      if (!current.trim()) {
        handlersRef.current?.setPrompt(STATIC_AD_RECREATE_PROMPT)
      }
      handlersRef.current?.focusPrompt()
      scrollComposerIntoView('start')
    },
    [scrollComposerIntoView],
  )

  const value = useMemo(
    () => ({
      aspectRatio,
      setAspectRatio,
      language,
      setLanguage,
      activePresetId,
      clearActivePreset,
      composerRef,
      applyFormatPreset,
      insertSnippet,
      registerPromptHandlers,
      templateReference,
      applyTemplate,
      clearTemplateReference,
    }),
    [
      aspectRatio,
      language,
      activePresetId,
      clearActivePreset,
      applyFormatPreset,
      insertSnippet,
      registerPromptHandlers,
      templateReference,
      applyTemplate,
      clearTemplateReference,
    ],
  )

  return <StaticAdStudioContext.Provider value={value}>{children}</StaticAdStudioContext.Provider>
}

export function useStaticAdStudio() {
  const context = useContext(StaticAdStudioContext)
  if (!context) {
    throw new Error('useStaticAdStudio must be used within StaticAdStudioProvider')
  }
  return context
}
