'use client'

import { animateImage, editVideo } from '@/actions/fal.actions'
import { ClipAiDialog, type ClipAiMode, type ClipAiSubmitPayload } from '@/components/video/ai/clip-ai-dialog'
import { importMediaFromUrl } from '@/lib/video/media-import'
import { resolveFalMediaUrl } from '@/lib/video/resolve-fal-media-url'
import { useVideoEditorStore } from '@/lib/video/store'
import { isMediaAssetAvailable } from '@/lib/video/types'
import type { ClipId } from '@socialista/types'
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'

type DialogTarget = {
  clipId: ClipId
  mode: ClipAiMode
}

type ClipAiContextValue = {
  openClipAi: (clipId: ClipId) => void
  isProcessingClip: (clipId: ClipId) => boolean
  canUseClipAi: (clipId: ClipId) => boolean
  getClipAiMode: (clipId: ClipId) => ClipAiMode | null
}

const ClipAiContext = createContext<ClipAiContextValue | null>(null)

export function useClipAiOptional(): ClipAiContextValue | null {
  return useContext(ClipAiContext)
}

export function useClipAi(): ClipAiContextValue {
  const context = useClipAiOptional()
  if (!context) {
    throw new Error('useClipAi must be used within ClipAiProvider')
  }
  return context
}

function getClipAiModeForClip(clipId: ClipId): ClipAiMode | null {
  const { project, assets } = useVideoEditorStore.getState()
  const clip = project.clips[clipId]
  if (!clip || clip.type === 'audio') return null

  const asset = assets[clip.assetId]
  if (!asset || !isMediaAssetAvailable(asset)) return null

  if (clip.type === 'video' || asset.type === 'video') return 'edit-video'
  if (clip.type === 'image' || asset.type === 'image') return 'animate-image'
  return null
}

export function ClipAiProvider({ children }: { children: ReactNode }) {
  const applyClipAiResult = useVideoEditorStore(s => s.applyClipAiResult)

  const [dialogTarget, setDialogTarget] = useState<DialogTarget | null>(null)
  const [processingClipIds, setProcessingClipIds] = useState<Set<ClipId>>(() => new Set())

  const setProcessing = useCallback((clipId: ClipId, processing: boolean) => {
    setProcessingClipIds(prev => {
      const next = new Set(prev)
      if (processing) next.add(clipId)
      else next.delete(clipId)
      return next
    })
  }, [])

  const canUseClipAi = useCallback((clipId: ClipId) => getClipAiModeForClip(clipId) !== null, [])

  const getClipAiMode = useCallback((clipId: ClipId) => getClipAiModeForClip(clipId), [])

  const openClipAi = useCallback((clipId: ClipId) => {
    const mode = getClipAiModeForClip(clipId)
    if (!mode) {
      toast.error('Select a video or image clip with available media')
      return
    }
    setDialogTarget({ clipId, mode })
  }, [])

  const runAiAction = useCallback(
    async (payload: ClipAiSubmitPayload) => {
      const { clipId } = payload
      const { project, assets } = useVideoEditorStore.getState()
      const clip = project.clips[clipId]
      const asset = clip ? assets[clip.assetId] : undefined

      if (!clip || clip.type === 'audio' || !asset || !isMediaAssetAvailable(asset)) {
        toast.error('Clip media is unavailable')
        return
      }

      setDialogTarget(null)
      setProcessing(clipId, true)

      try {
        const sourceUrl = asset.objectUrl
        const baseName = asset.name.replace(/\.[^.]+$/, '')

        if (payload.mode === 'edit-video') {
          const falVideoUrl = await resolveFalMediaUrl(sourceUrl, 'video')
          const result = await editVideo(payload.prompt, falVideoUrl, payload.resolution)

          if (!result.success) {
            toast.error(result.error)
            return
          }

          const imported = await importMediaFromUrl(result.data.url, `${baseName} (AI edit).mp4`)
          applyClipAiResult(clipId, imported)
          toast.success('Video clip updated')
          return
        }

        const falImageUrl = await resolveFalMediaUrl(sourceUrl, 'image')
        const result = await animateImage(payload.prompt, falImageUrl, payload.duration)

        if (!result.success) {
          toast.error(result.error)
          return
        }

        const imported = await importMediaFromUrl(result.data.url, `${baseName} (AI animate).mp4`)
        applyClipAiResult(clipId, imported)
        toast.success('Image animated into video')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'AI generation failed')
      } finally {
        setProcessing(clipId, false)
      }
    },
    [applyClipAiResult, setProcessing],
  )

  const value = useMemo<ClipAiContextValue>(
    () => ({
      openClipAi,
      isProcessingClip: clipId => processingClipIds.has(clipId),
      canUseClipAi,
      getClipAiMode,
    }),
    [canUseClipAi, getClipAiMode, openClipAi, processingClipIds],
  )

  return (
    <ClipAiContext.Provider value={value}>
      {children}
      <ClipAiDialog
        open={dialogTarget !== null}
        mode={dialogTarget?.mode ?? null}
        clipId={dialogTarget?.clipId ?? null}
        onOpenChange={open => {
          if (!open) setDialogTarget(null)
        }}
        onSubmit={runAiAction}
      />
    </ClipAiContext.Provider>
  )
}
