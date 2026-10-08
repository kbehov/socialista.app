'use client'

import type { AttachedMedia } from '@/components/files/attach-media/types'
import { templateReferencesToAttachedMedia, templateToRecreateAttachments } from '@/lib/studio/template-media'
import { commitHaptic } from '@/utils/haptics'
import {
  StudioTemplateKind,
  type StudioTemplateDto,
  type VideoAspectRatio,
  type VideoResolution,
} from '@socialista/types'
import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react'

type PromptHandlers = {
  insertAtCursor: (snippet: string) => void
  setPrompt: (text: string) => void
  setAttachments: (attachments: AttachedMedia[]) => void
  addAttachments: (attachments: AttachedMedia[]) => void
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
  applyTemplate: (template: StudioTemplateDto) => void
  attachReference: (template: StudioTemplateDto) => void
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

  const attachReference = useCallback(
    (template: StudioTemplateDto) => {
      if (template.kind !== StudioTemplateKind.VIDEO) return
      const attachments = templateToRecreateAttachments(template)
      if (attachments.length === 0) {
        const preview = template.previewImageUrl
        if (!preview) return
        handlersRef.current?.addAttachments(
          templateReferencesToAttachedMedia(template, [preview]),
        )
      } else {
        handlersRef.current?.addAttachments(attachments)
      }
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
      attachReference,
      registerPromptHandlers,
    }),
    [insertSnippet, setPrompt, applyTemplate, attachReference, registerPromptHandlers],
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
