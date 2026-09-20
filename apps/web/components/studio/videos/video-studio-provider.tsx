'use client'

import type { AttachedMedia } from '@/components/files/attach-media/types'
import { presetToAttachedMedia } from '@/lib/studio/preset-media'
import { templateReferencesToAttachedMedia } from '@/lib/studio/template-media'
import { commitHaptic } from '@/utils/haptics'
import {
  StudioTemplateKind,
  type Preset,
  type StudioTemplateDto,
  type VideoAspectRatio,
  type VideoResolution,
} from '@socialista/types'
import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react'

type PromptHandlers = {
  insertAtCursor: (snippet: string) => void
  setPrompt: (text: string) => void
  setAttachments: (attachments: AttachedMedia[]) => void
  focusPrompt: () => void
  setModel?: (modelValue: string) => void
  setAspectRatio?: (ratio: VideoAspectRatio) => void
  setDuration?: (seconds: number) => void
  setResolution?: (resolution: VideoResolution) => void
  setGenerateAudio?: (enabled: boolean) => void
}

type VideoStudioContextValue = {
  composerRef: React.RefObject<HTMLDivElement | null>
  insertSnippet: (snippet: string) => void
  setPrompt: (text: string) => void
  applyPreset: (preset: Preset) => void
  applyTemplate: (template: StudioTemplateDto) => void
  registerPromptHandlers: (handlers: PromptHandlers) => void
}

const VideoStudioContext = createContext<VideoStudioContextValue | null>(null)

export function VideoStudioProvider({ children }: { children: ReactNode }) {
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

  const applyTemplate = useCallback(
    (template: StudioTemplateDto) => {
      if (template.kind !== StudioTemplateKind.VIDEO) return
      const handlers = handlersRef.current
      const { payload } = template
      handlers?.setPrompt(payload.prompt ?? '')
      handlers?.setAttachments(
        templateReferencesToAttachedMedia(
          template,
          payload.referenceImageUrl ? [payload.referenceImageUrl] : [],
        ),
      )
      if (payload.model) handlers?.setModel?.(payload.model)
      if (payload.aspectRatio) handlers?.setAspectRatio?.(payload.aspectRatio)
      if (payload.durationSec) handlers?.setDuration?.(payload.durationSec)
      if (payload.resolution) handlers?.setResolution?.(payload.resolution)
      if (payload.generateAudio !== undefined) handlers?.setGenerateAudio?.(payload.generateAudio)
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
      applyTemplate,
      registerPromptHandlers,
    }),
    [insertSnippet, setPrompt, applyPreset, applyTemplate, registerPromptHandlers],
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

export function useOptionalVideoStudio() {
  return useContext(VideoStudioContext)
}
