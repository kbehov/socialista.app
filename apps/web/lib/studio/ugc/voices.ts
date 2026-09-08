import type { UgcClip, UgcClipVoice, UgcProject } from '@socialista/types'

export function ugcVoiceEquals(a?: UgcClipVoice, b?: UgcClipVoice) {
  if (a === b) return true
  if (!a || !b) return false
  return (
    a.provider === b.provider &&
    a.voiceId === b.voiceId &&
    a.voiceName === b.voiceName &&
    a.speed === b.speed &&
    a.stability === b.stability &&
    a.similarity === b.similarity &&
    a.style === b.style &&
    Boolean(a.speakerBoost) === Boolean(b.speakerBoost) &&
    (a.enabled !== false) === (b.enabled !== false)
  )
}

export function buildCampaignVoicePatches(
  project: UgcProject,
  voice: UgcClipVoice,
  clipId?: string,
): {
  skip: boolean
  campaignVoice: UgcClipVoice
  disableClip: boolean
  clearClipOverride: boolean
  clipPatch?: { voice?: UgcClipVoice | null }
  localClipPatch?: Partial<UgcClip>
} {
  const campaignVoice = { ...voice, enabled: true }
  const clipVoice = clipId ? project.clips.find(item => item.id === clipId)?.voice : undefined
  const disableClip = Boolean(clipId) && voice.enabled === false
  const clearClipOverride =
    Boolean(clipId) && voice.enabled !== false && clipVoice != null && clipVoice.enabled !== false

  if (ugcVoiceEquals(project.voice, campaignVoice) && !disableClip && !clearClipOverride) {
    return { skip: true, campaignVoice, disableClip, clearClipOverride }
  }

  let clipPatch: { voice?: UgcClipVoice | null } | undefined
  let localClipPatch: Partial<UgcClip> | undefined
  if (clipId && disableClip) {
    clipPatch = { voice }
    localClipPatch = { voice }
  } else if (clipId && clearClipOverride) {
    clipPatch = { voice: null }
    localClipPatch = { voice: undefined }
  }

  return { skip: false, campaignVoice, disableClip, clearClipOverride, clipPatch, localClipPatch }
}
