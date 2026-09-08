'use client'

import {
  readGenerationAccessToken,
  storeGenerationAccessToken,
} from '@/lib/image-generation/session'
import type { UgcProject } from '@socialista/types'
import { useCallback, useMemo, useState } from 'react'

export type UgcPipeline = 'stills' | 'video' | 'assemble' | 'audio'

export type UgcActiveRun = {
  key: string
  clipId?: string
  runId: string
  accessToken: string
  pipeline: UgcPipeline
  progress: number
  progressLabel: string
}

const RUN_STORAGE_PREFIX = 'ugc-run:'
const LEGACY_CLIP_RUN = 'ugc-clip-run:'
const LEGACY_CLIP_AUDIO_RUN = 'ugc-clip-audio-run:'
const LEGACY_STILLS_RUN = 'ugc-stills-run:'
const LEGACY_ASSEMBLE_RUN = 'ugc-assemble-run:'
const LEGACY_AUDIO_RUN = 'ugc-audio-run:'

function runStorageKey(projectId: string, pipeline: UgcPipeline, clipId?: string) {
  const scope = clipId ? `${clipId}:${pipeline}` : pipeline
  return `${RUN_STORAGE_PREFIX}${projectId}:${scope}`
}

function pipelineLabel(pipeline: UgcPipeline) {
  switch (pipeline) {
    case 'audio':
      return 'Generating voiceover…'
    case 'video':
      return 'Rendering…'
    case 'assemble':
      return 'Stitching…'
    case 'stills':
      return 'Generating photos…'
  }
}

function rememberRun(projectId: string, runId: string, token: string, pipeline: UgcPipeline, clipId?: string) {
  storeGenerationAccessToken(runId, token)
  sessionStorage.setItem(runStorageKey(projectId, pipeline, clipId), runId)
}

function readStoredRunId(projectId: string, pipeline: UgcPipeline, clipId?: string): string | null {
  const key = runStorageKey(projectId, pipeline, clipId)
  const stored = sessionStorage.getItem(key)
  if (stored) return stored

  if (clipId) {
    if (pipeline === 'audio') {
      return sessionStorage.getItem(`${LEGACY_CLIP_AUDIO_RUN}${clipId}`)
    }
    if (pipeline === 'stills' || pipeline === 'video') {
      return sessionStorage.getItem(`${LEGACY_CLIP_RUN}${clipId}`)
    }
  } else if (pipeline === 'stills') {
    return sessionStorage.getItem(`${LEGACY_STILLS_RUN}${projectId}`)
  } else if (pipeline === 'audio') {
    return sessionStorage.getItem(`${LEGACY_AUDIO_RUN}${projectId}`)
  } else if (pipeline === 'assemble') {
    return sessionStorage.getItem(`${LEGACY_ASSEMBLE_RUN}${projectId}`)
  }

  return null
}

function clearStoredRun(projectId: string, pipeline: UgcPipeline, clipId?: string) {
  sessionStorage.removeItem(runStorageKey(projectId, pipeline, clipId))
  if (clipId && pipeline === 'audio') {
    sessionStorage.removeItem(`${LEGACY_CLIP_AUDIO_RUN}${clipId}`)
  } else if (clipId) {
    sessionStorage.removeItem(`${LEGACY_CLIP_RUN}${clipId}`)
  } else if (pipeline === 'stills') {
    sessionStorage.removeItem(`${LEGACY_STILLS_RUN}${projectId}`)
  } else if (pipeline === 'audio') {
    sessionStorage.removeItem(`${LEGACY_AUDIO_RUN}${projectId}`)
  } else if (pipeline === 'assemble') {
    sessionStorage.removeItem(`${LEGACY_ASSEMBLE_RUN}${projectId}`)
  }
}

function makeRun(
  runId: string,
  accessToken: string,
  pipeline: UgcPipeline,
  clipId?: string,
): UgcActiveRun {
  return {
    key: `${clipId ?? pipeline}:${runId}`,
    clipId,
    runId,
    accessToken,
    pipeline,
    progress: 8,
    progressLabel: pipelineLabel(pipeline),
  }
}

export function restoreUgcActiveRuns(project: UgcProject): UgcActiveRun[] {
  const next: UgcActiveRun[] = []
  const seen = new Set<string>()

  const push = (run: UgcActiveRun | null) => {
    if (!run || seen.has(run.runId)) return
    seen.add(run.runId)
    next.push(run)
  }

  const stillsRunId = readStoredRunId(project.id, 'stills')
  if (stillsRunId) {
    const token = readGenerationAccessToken(stillsRunId)
    if (token && project.clips.some(clip => clip.status === 'generating')) {
      push(makeRun(stillsRunId, token, 'stills'))
    }
  }

  const audioRunId = readStoredRunId(project.id, 'audio')
  if (audioRunId) {
    const token = readGenerationAccessToken(audioRunId)
    if (token) push(makeRun(audioRunId, token, 'audio'))
  }

  for (const clip of project.clips) {
    const clipAudioRunId = readStoredRunId(project.id, 'audio', clip.id)
    if (clipAudioRunId) {
      const token = readGenerationAccessToken(clipAudioRunId)
      if (token) push(makeRun(clipAudioRunId, token, 'audio', clip.id))
    }

    if (clip.status !== 'generating') continue

    const storedRunId = readStoredRunId(project.id, 'stills', clip.id)
    const candidates = [storedRunId, clip.videoRunId, clip.stillsRunId].filter(
      (id): id is string => Boolean(id),
    )
    for (const id of candidates) {
      if (seen.has(id)) break
      const token = readGenerationAccessToken(id)
      if (!token) continue
      const pipeline: UgcPipeline = clip.videoRunId === id ? 'video' : 'stills'
      push(makeRun(id, token, pipeline, clip.id))
      break
    }
  }

  if (project.assembledRunId && project.status === 'generating') {
    const runId = readStoredRunId(project.id, 'assemble') ?? project.assembledRunId
    const accessToken = readGenerationAccessToken(runId)
    if (accessToken) push(makeRun(runId, accessToken, 'assemble'))
  }

  return next
}

export function useUgcActiveRuns({
  project,
  setProject,
}: {
  project: UgcProject
  setProject: (project: UgcProject) => void
}) {
  const [activeRuns, setActiveRuns] = useState<UgcActiveRun[]>([])

  const startRun = useCallback(
    (
      handle: { project: UgcProject; runId: string; publicAccessToken: string },
      pipeline: UgcPipeline,
      clipId?: string,
    ) => {
      rememberRun(handle.project.id, handle.runId, handle.publicAccessToken, pipeline, clipId)
      setProject(handle.project)
      setActiveRuns(current => {
        const without = current.filter(run => {
          if (run.runId === handle.runId) return false
          if (pipeline === 'audio') {
            if (clipId) return !(run.pipeline === 'audio' && run.clipId === clipId)
            return !(run.pipeline === 'audio' && !run.clipId)
          }
          if (clipId) return run.clipId !== clipId
          return run.pipeline !== pipeline || Boolean(run.clipId) !== !clipId
        })
        return [
          ...without,
          {
            key: `${clipId ?? pipeline}:${handle.runId}`,
            clipId,
            runId: handle.runId,
            accessToken: handle.publicAccessToken,
            pipeline,
            progress: 8,
            progressLabel:
              pipeline === 'audio'
                ? 'Generating voiceover…'
                : pipeline === 'video'
                  ? 'Rendering…'
                  : pipeline === 'assemble'
                    ? 'Stitching…'
                    : 'Starting…',
          },
        ]
      })
    },
    [setProject],
  )

  const updateRunProgress = useCallback((runKey: string, progress: number, label: string) => {
    setActiveRuns(current => {
      const item = current.find(entry => entry.key === runKey)
      if (!item || (item.progress === progress && item.progressLabel === label)) return current
      return current.map(entry =>
        entry.key === runKey ? { ...entry, progress, progressLabel: label } : entry,
      )
    })
  }, [])

  const settleRun = useCallback(
    (run: UgcActiveRun) => {
      if (run.pipeline === 'audio') {
        clearStoredRun(project.id, 'audio', run.clipId)
      }
      setActiveRuns(current => current.filter(item => item.key !== run.key))
    },
    [project.id],
  )

  const runsByClipId = useMemo(() => {
    const map: Record<string, { progress: number; label: string }> = {}
    const projectStills = activeRuns.find(run => run.pipeline === 'stills' && !run.clipId)
    const projectAudio = activeRuns.find(run => run.pipeline === 'audio' && !run.clipId)
    for (const clip of project.clips) {
      if (projectStills) {
        map[clip.id] = { progress: projectStills.progress, label: projectStills.progressLabel }
      } else if (projectAudio) {
        map[clip.id] = { progress: projectAudio.progress, label: projectAudio.progressLabel }
      }
    }
    for (const run of activeRuns) {
      if (!run.clipId) continue
      map[run.clipId] = { progress: run.progress, label: run.progressLabel }
    }
    return map
  }, [activeRuns, project.clips])

  const stillsRun = activeRuns.find(run => run.pipeline === 'stills')
  const videoBusy = activeRuns.some(run => run.pipeline === 'video')
  const assembling = activeRuns.some(run => run.pipeline === 'assemble')
  const anyGenerating =
    project.clips.some(clip => clip.status === 'generating') || activeRuns.length > 0

  return {
    activeRuns,
    setActiveRuns,
    startRun,
    updateRunProgress,
    settleRun,
    runsByClipId,
    stillsRun,
    videoBusy,
    assembling,
    anyGenerating,
  }
}
