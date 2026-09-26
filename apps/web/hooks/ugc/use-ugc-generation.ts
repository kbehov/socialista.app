'use client'

import {
  startUgcAudioGeneration,
  startUgcStillsGeneration,
  startUgcVideoGeneration,
} from '@/actions/ugc-generation.actions'
import type { ImagePromptSubmitResult } from '@/components/studio/images/prompt-input'
import type { VideoPromptSubmitResult } from '@/components/studio/videos/video-prompt-input'
import type { UgcPipeline } from '@/types/ugc.types'
import type {
  UpdateUgcClipPayload,
  UpdateUgcProjectPayload,
  UgcClip,
  UgcProject,
} from '@socialista/types'
import {
  ugcClipRenderDurationSec,
  ugcClipUsesTalkingHeadModel,
  ugcScriptMaxChars,
} from '@socialista/types'
import { useCallback } from 'react'
import { toast } from 'sonner'

type StartRun = (
  handle: { runId: string; publicAccessToken: string },
  pipeline: UgcPipeline,
  clipId?: string,
) => void

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
}: {
  projectId: string
  project: UgcProject
  patchProject: (payload: UpdateUgcProjectPayload) => Promise<void>
  patchProjectLocal: (patch: Partial<UgcProject>) => void
  patchClip: (clipId: string, payload: UpdateUgcClipPayload) => Promise<void>
  patchClipLocal: (clipId: string, patch: Partial<UgcClip>) => void
  startRun: StartRun
}) {
  const markClipGenerating = useCallback(
    (
      clipId: string,
      pipeline: Extract<UgcPipeline, 'stills' | 'video' | 'audio'>,
      runId: string,
    ) => {
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

  const startClipStills = useCallback(
    async (
      clipId: string,
      extra?: {
        prompt?: string
        model?: string
        referenceImageUrls?: string[]
        count?: number
        skipEnhance?: boolean
        skillId?: string
      },
    ) => {
      try {
        const result = await startUgcStillsGeneration({
          projectId,
          clipId,
          ...extra,
        })
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
    async (
      clipId: string,
      extra?: {
        plannedPrompt?: string
        skipPlanner?: boolean
        skillId?: string
        generateAudio?: boolean
      },
    ) => {
      try {
        const result = await startUgcVideoGeneration({
          projectId,
          clipId,
          ...extra,
        })
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
            ...(result.enhance ? {} : { skipEnhance: true }),
            ...(result.enhance && result.skillId ? { skillId: result.skillId } : {}),
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
          const talkingHead = ugcClipUsesTalkingHeadModel(selectedClip.type)
          if (talkingHead && !selectedClip.audioUrl) {
            toast.error('Generate the voiceover before rendering this talking-head scene')
            return
          }
          if (result.aspectRatio !== project.aspectRatio) {
            patchProjectLocal({ aspectRatio: result.aspectRatio })
            await patchProject({ aspectRatio: result.aspectRatio })
          }
          if (result.resolution !== project.videoResolution) {
            patchProjectLocal({ videoResolution: result.resolution })
            await patchProject({ videoResolution: result.resolution })
          }
          const attachedUrl = result.imageUrls[0]
          const persistedStartFrame = selectedClip.stills.find(
            still => still.imageUrl,
          )
          if (talkingHead && !attachedUrl && !persistedStartFrame?.imageUrl) {
            toast.error('Attach a creator photo or generate one first')
            return
          }
          const enhance = result.enhance !== false
          const durationSec =
            ugcClipRenderDurationSec(selectedClip, selectedClip.type) ??
            result.duration
          const persistAttachedStill =
            Boolean(attachedUrl) && persistedStartFrame?.imageUrl !== attachedUrl
          const matchingStill = attachedUrl
            ? selectedClip.stills.find(still => still.imageUrl === attachedUrl)
            : undefined
          const nextStills =
            persistAttachedStill && attachedUrl
              ? [
                  matchingStill
                    ? { ...matchingStill, index: 0 }
                    : { index: 0, imageUrl: attachedUrl },
                  ...selectedClip.stills
                    .filter(
                      still => still.imageUrl && still.imageUrl !== attachedUrl,
                    )
                    .map((still, index) => ({ ...still, index: index + 1 })),
                ]
              : !persistedStartFrame && attachedUrl
                ? [{ index: 0, imageUrl: attachedUrl }]
                : undefined
          await patchClip(selectedClip.id, {
            directions: result.prompt,
            plannedPrompt: enhance ? null : result.prompt,
            ...(durationSec != null ? { durationSec } : {}),
            models: {
              video: result.model,
            },
            ...(nextStills ? { stills: nextStills } : {}),
          })
          await startClipVideo(
            selectedClip.id,
            enhance
              ? {
                  generateAudio: talkingHead ? false : result.generateAudio,
                  ...(result.skillId ? { skillId: result.skillId } : {}),
                }
              : {
                  plannedPrompt: result.prompt,
                  skipPlanner: true,
                  generateAudio: talkingHead ? false : result.generateAudio,
                },
          )
        } catch (error) {
          toastError(error, 'Could not generate video')
        }
      })()
    },
    [
      patchClip,
      patchProject,
      patchProjectLocal,
      project.aspectRatio,
      project.videoResolution,
      startClipVideo,
    ],
  )

  const generateClipAudio = useCallback(
    async (clipId: string, script?: string) => {
      try {
        const result = await startUgcAudioGeneration({
          projectId,
          clipId,
          ...(script
            ? {
                text: script.slice(
                  0,
                  ugcScriptMaxChars(
                    project.clips.find(clip => clip.id === clipId)?.type,
                  ),
                ),
              }
            : {}),
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
    [markClipGenerating, project.clips, projectId, startRun],
  )

  return {
    handleImageSubmit,
    handleVideoSubmit,
    generateClipAudio,
  }
}
