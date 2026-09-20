import {
  readGenerationAccessToken,
  storeGenerationAccessToken,
} from '@/lib/image-generation/session'
import type { UgcPipeline } from '@/types/ugc.types'

const RUN_STORAGE_PREFIX = 'ugc-run:'
const LEGACY_CLIP_RUN = 'ugc-clip-run:'
const LEGACY_CLIP_AUDIO_RUN = 'ugc-clip-audio-run:'
const LEGACY_STILLS_RUN = 'ugc-stills-run:'
const LEGACY_AUDIO_RUN = 'ugc-audio-run:'

export function ugcRunStorageKey(
  projectId: string,
  pipeline: UgcPipeline,
  clipId?: string,
) {
  const scope = clipId ? `${clipId}:${pipeline}` : pipeline
  return `${RUN_STORAGE_PREFIX}${projectId}:${scope}`
}

export function rememberUgcRun(
  projectId: string,
  runId: string,
  token: string,
  pipeline: UgcPipeline,
  clipId?: string,
) {
  storeGenerationAccessToken(runId, token)
  sessionStorage.setItem(ugcRunStorageKey(projectId, pipeline, clipId), runId)
}

export function readStoredUgcRunId(
  projectId: string,
  pipeline: UgcPipeline,
  clipId?: string,
): string | null {
  const key = ugcRunStorageKey(projectId, pipeline, clipId)
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
  }

  return null
}

export function clearStoredUgcRun(
  projectId: string,
  pipeline: UgcPipeline,
  clipId?: string,
) {
  sessionStorage.removeItem(ugcRunStorageKey(projectId, pipeline, clipId))
  if (clipId && pipeline === 'audio') {
    sessionStorage.removeItem(`${LEGACY_CLIP_AUDIO_RUN}${clipId}`)
  } else if (clipId) {
    sessionStorage.removeItem(`${LEGACY_CLIP_RUN}${clipId}`)
  } else if (pipeline === 'stills') {
    sessionStorage.removeItem(`${LEGACY_STILLS_RUN}${projectId}`)
  } else if (pipeline === 'audio') {
    sessionStorage.removeItem(`${LEGACY_AUDIO_RUN}${projectId}`)
  }
}

export function ugcPipelineLabel(pipeline: UgcPipeline) {
  switch (pipeline) {
    case 'audio':
      return 'Generating voiceover…'
    case 'video':
      return 'Rendering…'
    case 'stills':
      return 'Generating photos…'
  }
}

export { readGenerationAccessToken }
