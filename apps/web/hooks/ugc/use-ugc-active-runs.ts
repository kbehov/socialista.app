'use client'

import type { UgcActiveRun, UgcPipeline } from '@/types/ugc.types'
import {
  clearStoredUgcRun,
  readGenerationAccessToken,
  readStoredUgcRunId,
  rememberUgcRun,
  ugcPipelineLabel,
} from '@/utils/ugc/run-storage.utils'
import type { UgcProject } from '@socialista/types'
import { useCallback, useMemo, useState } from 'react'

export type { UgcActiveRun, UgcPipeline }

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
    progressLabel: ugcPipelineLabel(pipeline),
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

  const stillsRunId = readStoredUgcRunId(project.id, 'stills')
  if (stillsRunId) {
    const token = readGenerationAccessToken(stillsRunId)
    if (token && project.clips.some(clip => clip.status === 'generating')) {
      push(makeRun(stillsRunId, token, 'stills'))
    }
  }

  const audioRunId = readStoredUgcRunId(project.id, 'audio')
  if (audioRunId) {
    const token = readGenerationAccessToken(audioRunId)
    if (token) push(makeRun(audioRunId, token, 'audio'))
  }

  for (const clip of project.clips) {
    const clipAudioRunId = readStoredUgcRunId(project.id, 'audio', clip.id)
    if (clipAudioRunId) {
      const token = readGenerationAccessToken(clipAudioRunId)
      if (token) push(makeRun(clipAudioRunId, token, 'audio', clip.id))
    }

    if (clip.status !== 'generating') continue

    const storedRunId = readStoredUgcRunId(project.id, 'stills', clip.id)
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

  return next
}

export function useUgcActiveRuns({ project }: { project: UgcProject }) {
  const [activeRuns, setActiveRuns] = useState<UgcActiveRun[]>([])

  const startRun = useCallback(
    (
      handle: { runId: string; publicAccessToken: string },
      pipeline: UgcPipeline,
      clipId?: string,
    ) => {
      rememberUgcRun(project.id, handle.runId, handle.publicAccessToken, pipeline, clipId)
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
                  : 'Starting…',
          },
        ]
      })
    },
    [project.id],
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
        clearStoredUgcRun(project.id, 'audio', run.clipId)
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
    anyGenerating,
  }
}
