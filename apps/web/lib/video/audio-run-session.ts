import {
  readGenerationAccessToken,
  storeGenerationAccessToken,
} from '@/lib/image-generation/session'
import type { GenerateAudioVoice } from '@socialista/types'

const RUN_KEY_PREFIX = 'video-audio-run:'
const PLACED_KEY_PREFIX = 'video-audio-placed:'
const PENDING_KEY = 'video-audio-pending'
const KICKOFF_KEY = 'video-audio-kickoff'

export type PendingVideoAudio = {
  text: string
  voice: GenerateAudioVoice
}

function runKey(videoId: string) {
  return `${RUN_KEY_PREFIX}${videoId}`
}

function placedKey(runId: string) {
  return `${PLACED_KEY_PREFIX}${runId}`
}

export function persistVideoAudioRun(videoId: string, runId: string, token: string) {
  try {
    storeGenerationAccessToken(runId, token)
    sessionStorage.setItem(runKey(videoId), runId)
  } catch {
    // ignore quota / private mode
  }
}

export function readVideoAudioRun(videoId: string): { runId: string; accessToken: string } | null {
  try {
    const runId = sessionStorage.getItem(runKey(videoId))
    if (!runId) return null
    const accessToken = readGenerationAccessToken(runId)
    if (!accessToken) return null
    return { runId, accessToken }
  } catch {
    return null
  }
}

export function clearVideoAudioRun(videoId: string) {
  try {
    sessionStorage.removeItem(runKey(videoId))
  } catch {
    // ignore
  }
}

export function markVideoAudioPlaced(runId: string) {
  try {
    sessionStorage.setItem(placedKey(runId), '1')
  } catch {
    // ignore
  }
}

export function wasVideoAudioPlaced(runId: string): boolean {
  try {
    return sessionStorage.getItem(placedKey(runId)) === '1'
  } catch {
    return false
  }
}

export function persistPendingVideoAudio(pending: PendingVideoAudio) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(pending))
  } catch {
    // ignore
  }
}

export function readPendingVideoAudio(): PendingVideoAudio | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PendingVideoAudio
    if (!parsed?.text || !parsed.voice?.voiceId) return null
    return parsed
  } catch {
    return null
  }
}

export function clearPendingVideoAudio() {
  try {
    sessionStorage.removeItem(PENDING_KEY)
  } catch {
    // ignore
  }
}

export function beginVideoAudioKickoff(): boolean {
  try {
    if (sessionStorage.getItem(KICKOFF_KEY) === '1') return false
    sessionStorage.setItem(KICKOFF_KEY, '1')
    return true
  } catch {
    return true
  }
}

export function endVideoAudioKickoff() {
  try {
    sessionStorage.removeItem(KICKOFF_KEY)
  } catch {
    // ignore
  }
}
