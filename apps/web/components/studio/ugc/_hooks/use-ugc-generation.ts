'use client'

import type { ImagePromptSubmitResult } from '@/components/studio/images/prompt-input'
import type { VideoPromptSubmitResult } from '@/components/studio/videos/video-prompt-input'
import type { UgcPipeline } from '@/components/studio/ugc/_hooks/use-ugc-active-runs'
import {
  assembleUgcProject,
  generateUgcClipAudio,
  generateUgcProjectAudio,
  generateUgcStills,
  generateUgcVideos,
} from '@/services/ugc-project.service'
import type { UpdateUgcProjectPayload, UgcClip, UgcProject } from '@socialista/types'
import { UGC_SCRIPT_MAX_CHARS } from '@socialista/types'
import { useCallback, useRef } from 'react'
import { toast } from 'sonner'

type StartRun = (
  handle: { project: UgcProject; runId: string; publicAccessToken: string },
  pipeline: UgcPipeline,
  clipId?: string,
) => void

export function useUgcGeneration({
  projectId,
  project,
  patchProject,
  patchProjectLocal,
  patchClip,
  startRun,
  onAssembleReady,
}: {
  projectId: string
  project: UgcProject
  patchProject: (payload: UpdateUgcProjectPayload) => Promise<void>
  patchProjectLocal: (patch: Partial<UgcProject>) => void
  patchClip: (clipId: string, payload: Parameters<typeof patchClip>[1]) => Promise<void>
  startRun: StartRun
  onAssembleReady?: (latest: UgcProject | null) => void
}) {
  const assembleWhenReadyRef = useRef(false)

  const handleAssemble = useCallback(() => {
    void assembleUgcProject(projectId).then(response => {
      if (!response.success || !response.data) {
        toast.error(response.message ?? 'Could not stitch the ad')
        return
      }
      assembleWhenReadyRef.current = false
      startRun(response.data, 'assemble')
    })
  }, [projectId, startRun])

  const tryAssembleIfReady = useCallback(
    (latest: UgcProject | null) => {
      if (!assembleWhenReadyRef.current || !latest) return
      const withVideo = latest.clips.filter(clip => Boolean(clip.videoUrl))
      if (withVideo.length === 0) return
      if (withVideo.some(clip => clip.status === 'generating')) return
      assembleWhenReadyRef.current = false
      handleAssemble()
      onAssembleReady?.(latest)
    },
    [handleAssemble, onAssembleReady],
  )

  const startClipStills = useCallback(
    (clipId: string, extra?: { prompt?: string; model?: string; referenceImageUrls?: string[]; count?: number }) => {
      void generateUgcStills(projectId, { clipId, ...extra }).then(response => {
        if (!response.success || !response.data) {
          toast.error(response.message ?? 'Could not generate photos')
          return
        }
        startRun(response.data, 'stills', clipId)
      })
    },
    [projectId, startRun],
  )

  const startClipVideo = useCallback(
    (clipId: string, extra?: { plannedPrompt?: string }) => {
      void generateUgcVideos(projectId, { clipId, ...extra }).then(response => {
        if (!response.success || !response.data) {
          toast.error(response.message ?? 'Could not generate video')
          return
        }
        startRun(response.data, 'video', clipId)
      })
    },
    [projectId, startRun],
  )

  const handleRenderAd = useCallback(
    (clips: UgcClip[]) => {
      assembleWhenReadyRef.current = true
      const missing = clips.filter(
        clip => clip.stills.some(still => still.imageUrl) && !clip.videoUrl,
      )
      if (missing.length === 0) {
        handleAssemble()
        return
      }
      void (async () => {
        for (const clip of missing) {
          const response = await generateUgcVideos(projectId, { clipId: clip.id })
          if (!response.success || !response.data) {
            toast.error(response.message ?? 'Could not render video')
            assembleWhenReadyRef.current = false
            return
          }
          startRun(response.data, 'video', clip.id)
        }
      })()
    },
    [handleAssemble, projectId, startRun],
  )

  const handleImageSubmit = useCallback(
    (selectedClip: UgcClip, result: ImagePromptSubmitResult) => {
      void (async () => {
        if (result.aspectRatio !== project.aspectRatio) {
          patchProjectLocal({ aspectRatio: result.aspectRatio })
          await patchProject({ aspectRatio: result.aspectRatio })
        }
        startClipStills(selectedClip.id, {
          prompt: result.prompt,
          model: result.model,
          referenceImageUrls: result.imageUrls,
          count: Math.min(result.numImages, 3),
        })
      })()
    },
    [patchProject, patchProjectLocal, project.aspectRatio, startClipStills],
  )

  const handleVideoSubmit = useCallback(
    (selectedClip: UgcClip, result: VideoPromptSubmitResult) => {
      void (async () => {
        if (result.aspectRatio !== project.aspectRatio) {
          patchProjectLocal({ aspectRatio: result.aspectRatio })
          await patchProject({ aspectRatio: result.aspectRatio })
        }
        await patchClip(selectedClip.id, { directions: result.prompt, plannedPrompt: result.prompt })
        startClipVideo(selectedClip.id, { plannedPrompt: result.prompt })
      })()
    },
    [patchClip, patchProject, patchProjectLocal, project.aspectRatio, startClipVideo],
  )

  const generateAllPhotos = useCallback(() => {
    void generateUgcStills(projectId, {}).then(response => {
      if (!response.success || !response.data) {
        toast.error(response.message ?? 'Could not generate photos')
        return
      }
      startRun(response.data, 'stills')
    })
  }, [projectId, startRun])

  const generateAllAudio = useCallback(async () => {
    const response = await generateUgcProjectAudio(projectId)
    if (!response.success || !response.data) {
      toast.error(response.message ?? 'Could not generate audio')
      return
    }
    startRun(response.data, 'audio')
  }, [projectId, startRun])

  const generateClipAudio = useCallback(
    async (clipId: string, script?: string) => {
      const response = await generateUgcClipAudio(projectId, clipId, {
        ...(script ? { script: script.slice(0, UGC_SCRIPT_MAX_CHARS) } : {}),
      })
      if (!response.success || !response.data) {
        toast.error(response.message ?? 'Could not generate audio')
        return
      }
      startRun(response.data, 'audio', clipId)
    },
    [projectId, startRun],
  )

  return {
    handleAssemble,
    tryAssembleIfReady,
    startClipStills,
    startClipVideo,
    handleRenderAd,
    handleImageSubmit,
    handleVideoSubmit,
    generateAllPhotos,
    generateAllAudio,
    generateClipAudio,
  }
}
