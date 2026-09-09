'use client'

import {
  startUgcAssemble,
  startUgcAudioGeneration,
  startUgcStillsGeneration,
  startUgcVideoGeneration,
} from '@/actions/ugc-generation.actions'
import type { ImagePromptSubmitResult } from '@/components/studio/images/prompt-input'
import type { VideoPromptSubmitResult } from '@/components/studio/videos/video-prompt-input'
import type { UgcPipeline } from '@/components/studio/ugc/_hooks/use-ugc-active-runs'
import type { UpdateUgcClipPayload, UpdateUgcProjectPayload, UgcClip, UgcProject } from '@socialista/types'
import { UGC_SCRIPT_MAX_CHARS, ugcClipGeneratesAudio, ugcResolvedClipVoice } from '@socialista/types'
import { useCallback, useRef } from 'react'
import { toast } from 'sonner'

type StartRun = (
  handle: { runId: string; publicAccessToken: string },
  pipeline: UgcPipeline,
  clipId?: string,
) => void

function clipNeedsVoiceover(project: UgcProject, clip: UgcClip): boolean {
  if (!ugcClipGeneratesAudio(clip.type)) return false
  if (!clip.script?.text.trim()) return false
  if (clip.audioUrl) return false
  return ugcResolvedClipVoice(project, clip).enabled !== false
}

function clipsMissingVideo(clips: UgcClip[]): UgcClip[] {
  return clips.filter(clip => clip.stills.some(still => still.imageUrl) && !clip.videoUrl)
}

function toastError(error: unknown, fallback: string) {
  toast.error(error instanceof Error ? error.message : fallback)
}

export function useUgcGeneration({
  projectId,
  project,
  patchProject,
  patchProjectLocal,
  patchClip,
  patchClipLocal,
  startRun,
  onAssembleReady,
}: {
  projectId: string
  project: UgcProject
  patchProject: (payload: UpdateUgcProjectPayload) => Promise<void>
  patchProjectLocal: (patch: Partial<UgcProject>) => void
  patchClip: (clipId: string, payload: UpdateUgcClipPayload) => Promise<void>
  patchClipLocal: (clipId: string, patch: Partial<UgcClip>) => void
  startRun: StartRun
  onAssembleReady?: (latest: UgcProject | null) => void
}) {
  const assembleWhenReadyRef = useRef(false)
  const renderAfterAudioRef = useRef(false)

  const markClipGenerating = useCallback(
    (clipId: string, pipeline: Extract<UgcPipeline, 'stills' | 'video' | 'audio'>, runId: string) => {
      const clipPatch: Partial<UgcClip> =
        pipeline === 'audio'
          ? { audioRunId: runId, error: undefined }
          : pipeline === 'video'
            ? { status: 'generating', videoRunId: runId, error: undefined }
            : { status: 'generating', stillsRunId: runId, error: undefined }
      patchClipLocal(clipId, clipPatch)
      if (pipeline !== 'audio') {
        patchProjectLocal({ status: 'generating', error: undefined })
      } else {
        patchProjectLocal({ error: undefined })
      }
    },
    [patchClipLocal, patchProjectLocal],
  )

  const handleAssemble = useCallback(async () => {
    try {
      const result = await startUgcAssemble({ projectId })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      assembleWhenReadyRef.current = false
      patchProjectLocal({ status: 'generating', assembledRunId: result.runId, error: undefined })
      startRun(result, 'assemble')
    } catch (error) {
      toastError(error, 'Could not stitch the ad')
    }
  }, [patchProjectLocal, projectId, startRun])

  const startMissingVideos = useCallback(
    async (clips: UgcClip[]) => {
      const missing = clipsMissingVideo(clips)
      if (missing.length === 0) {
        await handleAssemble()
        return
      }
      try {
        for (const clip of missing) {
          const result = await startUgcVideoGeneration({ projectId, clipId: clip.id })
          if (!result.success) {
            toast.error(result.error)
            assembleWhenReadyRef.current = false
            renderAfterAudioRef.current = false
            return
          }
          markClipGenerating(clip.id, 'video', result.runId)
          startRun(result, 'video', clip.id)
        }
      } catch (error) {
        assembleWhenReadyRef.current = false
        renderAfterAudioRef.current = false
        toastError(error, 'Could not render video')
      }
    },
    [handleAssemble, markClipGenerating, projectId, startRun],
  )

  const tryAssembleIfReady = useCallback(
    (latest: UgcProject | null) => {
      if (!latest) return
      if (renderAfterAudioRef.current) {
        renderAfterAudioRef.current = false
        void startMissingVideos(latest.clips)
        return
      }
      if (!assembleWhenReadyRef.current) return
      const withVideo = latest.clips.filter(clip => Boolean(clip.videoUrl))
      if (withVideo.length === 0) return
      if (latest.clips.some(clip => clip.status === 'generating')) return
      assembleWhenReadyRef.current = false
      void handleAssemble()
      onAssembleReady?.(latest)
    },
    [handleAssemble, onAssembleReady, startMissingVideos],
  )

  const startClipStills = useCallback(
    async (
      clipId: string,
      extra?: { prompt?: string; model?: string; referenceImageUrls?: string[]; count?: number },
    ) => {
      try {
        const result = await startUgcStillsGeneration({ projectId, clipId, ...extra })
        if (!result.success) {
          toast.error(result.error)
          return
        }
        markClipGenerating(clipId, 'stills', result.runId)
        startRun(result, 'stills', clipId)
      } catch (error) {
        toastError(error, 'Could not generate photos')
      }
    },
    [markClipGenerating, projectId, startRun],
  )

  const startClipVideo = useCallback(
    async (clipId: string, extra?: { plannedPrompt?: string; skipPlanner?: boolean }) => {
      try {
        const result = await startUgcVideoGeneration({ projectId, clipId, ...extra })
        if (!result.success) {
          toast.error(result.error)
          return
        }
        markClipGenerating(clipId, 'video', result.runId)
        startRun(result, 'video', clipId)
      } catch (error) {
        toastError(error, 'Could not generate video')
      }
    },
    [markClipGenerating, projectId, startRun],
  )

  const handleRenderAd = useCallback(
    (clips: UgcClip[]) => {
      assembleWhenReadyRef.current = true
      const missingVideo = clipsMissingVideo(clips)
      if (missingVideo.length === 0) {
        void handleAssemble()
        return
      }
      const missingAudio = missingVideo.filter(clip => clipNeedsVoiceover(project, clip))
      if (missingAudio.length > 0) {
        renderAfterAudioRef.current = true
        void (async () => {
          try {
            const result = await startUgcAudioGeneration({ projectId })
            if (!result.success) {
              toast.error(result.error)
              renderAfterAudioRef.current = false
              await startMissingVideos(clips)
              return
            }
            patchProjectLocal({ error: undefined })
            startRun(result, 'audio')
          } catch (error) {
            toastError(error, 'Could not generate audio')
            renderAfterAudioRef.current = false
            await startMissingVideos(clips)
          }
        })()
        return
      }
      void startMissingVideos(clips)
    },
    [handleAssemble, patchProjectLocal, project, projectId, startMissingVideos, startRun],
  )

  const handleImageSubmit = useCallback(
    (selectedClip: UgcClip, result: ImagePromptSubmitResult) => {
      void (async () => {
        try {
          if (result.aspectRatio !== project.aspectRatio) {
            patchProjectLocal({ aspectRatio: result.aspectRatio })
            await patchProject({ aspectRatio: result.aspectRatio })
          }
          await startClipStills(selectedClip.id, {
            prompt: result.prompt,
            model: result.model,
            referenceImageUrls: result.imageUrls,
            count: Math.min(result.numImages, 3),
          })
        } catch (error) {
          toastError(error, 'Could not generate photos')
        }
      })()
    },
    [patchProject, patchProjectLocal, project.aspectRatio, startClipStills],
  )

  const handleVideoSubmit = useCallback(
    (selectedClip: UgcClip, result: VideoPromptSubmitResult) => {
      void (async () => {
        try {
          if (result.aspectRatio !== project.aspectRatio) {
            patchProjectLocal({ aspectRatio: result.aspectRatio })
            await patchProject({ aspectRatio: result.aspectRatio })
          }
          if (result.resolution !== project.videoResolution) {
            patchProjectLocal({ videoResolution: result.resolution })
            await patchProject({ videoResolution: result.resolution })
          }
          const hasStartFrame = selectedClip.stills.some(still => still.imageUrl)
          const startFrameUrl = hasStartFrame ? undefined : result.imageUrls[0]
          const enhance = result.enhance !== false
          await patchClip(selectedClip.id, {
            directions: result.prompt,
            plannedPrompt: enhance ? null : result.prompt,
            durationSec: result.duration,
            models: { video: result.model },
            ...(startFrameUrl ? { stills: [{ index: 0, imageUrl: startFrameUrl }] } : {}),
          })
          await startClipVideo(
            selectedClip.id,
            enhance ? undefined : { plannedPrompt: result.prompt, skipPlanner: true },
          )
        } catch (error) {
          toastError(error, 'Could not generate video')
        }
      })()
    },
    [patchClip, patchProject, patchProjectLocal, project.aspectRatio, project.videoResolution, startClipVideo],
  )

  const generateAllPhotos = useCallback(async () => {
    try {
      const result = await startUgcStillsGeneration({ projectId })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      patchProjectLocal({
        status: 'generating',
        error: undefined,
        clips: project.clips.map(clip => ({
          ...clip,
          status: 'generating' as const,
          stillsRunId: result.runId,
          error: undefined,
        })),
      })
      startRun(result, 'stills')
    } catch (error) {
      toastError(error, 'Could not generate photos')
    }
  }, [patchProjectLocal, project.clips, projectId, startRun])

  const generateAllAudio = useCallback(async () => {
    try {
      const result = await startUgcAudioGeneration({ projectId })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      patchProjectLocal({
        error: undefined,
        clips: project.clips.map(clip =>
          ugcClipGeneratesAudio(clip.type)
            ? { ...clip, audioRunId: result.runId, error: undefined }
            : clip,
        ),
      })
      startRun(result, 'audio')
    } catch (error) {
      toastError(error, 'Could not generate audio')
    }
  }, [patchProjectLocal, project.clips, projectId, startRun])

  const generateClipAudio = useCallback(
    async (clipId: string, script?: string) => {
      try {
        const result = await startUgcAudioGeneration({
          projectId,
          clipId,
          ...(script ? { text: script.slice(0, UGC_SCRIPT_MAX_CHARS) } : {}),
        })
        if (!result.success) {
          toast.error(result.error)
          return
        }
        markClipGenerating(clipId, 'audio', result.runId)
        startRun(result, 'audio', clipId)
      } catch (error) {
        toastError(error, 'Could not generate audio')
      }
    },
    [markClipGenerating, projectId, startRun],
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
