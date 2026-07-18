'use client'

import { DEFAULT_AD_LANGUAGE } from '@/components/ui/language-selector'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type { StaticAdExample } from '../_lib/examples'
import type { StaticAdFormatPreset } from '../_lib/format-presets'
import { type SelectedProductImage, type StaticAdAspectRatio } from '../_lib/types'

export type { SelectedProductImage }

type StaticAdStudioContextValue = {
  aspectRatio: StaticAdAspectRatio
  setAspectRatio: (ratio: StaticAdAspectRatio) => void
  productImages: SelectedProductImage[]
  setProductImages: (images: SelectedProductImage[]) => void
  language: string
  setLanguage: (language: string) => void
  activeExampleId: string | null
  activePresetId: string | null
  clearActiveExample: () => void
  composerRef: React.RefObject<HTMLDivElement | null>
  remixExample: (example: StaticAdExample) => void
  applyFormatPreset: (preset: StaticAdFormatPreset) => void
  insertSnippet: (snippet: string) => void
  registerPromptHandlers: (handlers: {
    setPrompt: (text: string) => void
    setAspectRatio: (ratio: StaticAdAspectRatio) => void
    insertAtCursor: (snippet: string) => void
    focusPrompt: () => void
  }) => void
}

const StaticAdStudioContext = createContext<StaticAdStudioContextValue | null>(null)

export function StaticAdStudioProvider({ children }: { children: ReactNode }) {
  const [aspectRatio, setAspectRatio] = useState<StaticAdAspectRatio>('1:1')
  const [productImages, setProductImages] = useState<SelectedProductImage[]>([])
  const [language, setLanguage] = useState(DEFAULT_AD_LANGUAGE)
  const [activeExampleId, setActiveExampleId] = useState<string | null>(null)
  const [activePresetId, setActivePresetId] = useState<string | null>(null)
  const composerRef = useRef<HTMLDivElement>(null)
  const handlersRef = useRef<{
    setPrompt: (text: string) => void
    setAspectRatio: (ratio: StaticAdAspectRatio) => void
    insertAtCursor: (snippet: string) => void
    focusPrompt: () => void
  } | null>(null)

  const registerPromptHandlers = useCallback(
    (handlers: {
      setPrompt: (text: string) => void
      setAspectRatio: (ratio: StaticAdAspectRatio) => void
      insertAtCursor: (snippet: string) => void
      focusPrompt: () => void
    }) => {
      handlersRef.current = handlers
    },
    [],
  )

  const clearActiveExample = useCallback(() => {
    setActiveExampleId(null)
    setActivePresetId(null)
  }, [])

  const scrollComposerIntoView = useCallback((block: ScrollLogicalPosition = 'nearest') => {
    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    composerRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block,
    })
  }, [])

  const remixExample = useCallback(
    (example: StaticAdExample) => {
      handlersRef.current?.setPrompt(example.prompt)
      handlersRef.current?.setAspectRatio(example.aspectRatio)
      handlersRef.current?.focusPrompt()
      setAspectRatio(example.aspectRatio)
      setActiveExampleId(example.id)
      setActivePresetId(null)
      scrollComposerIntoView('start')
    },
    [scrollComposerIntoView],
  )

  const applyFormatPreset = useCallback(
    (preset: StaticAdFormatPreset) => {
      handlersRef.current?.setPrompt(preset.prompt)
      handlersRef.current?.setAspectRatio(preset.aspectRatio)
      handlersRef.current?.focusPrompt()
      setAspectRatio(preset.aspectRatio)
      setActivePresetId(preset.id)
      setActiveExampleId(null)
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

  const value = useMemo(
    () => ({
      aspectRatio,
      setAspectRatio,
      productImages,
      setProductImages,
      language,
      setLanguage,
      activeExampleId,
      activePresetId,
      clearActiveExample,
      composerRef,
      remixExample,
      applyFormatPreset,
      insertSnippet,
      registerPromptHandlers,
    }),
    [
      aspectRatio,
      productImages,
      language,
      activeExampleId,
      activePresetId,
      clearActiveExample,
      remixExample,
      applyFormatPreset,
      insertSnippet,
      registerPromptHandlers,
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
