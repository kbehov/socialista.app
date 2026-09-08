import type { UgcClipVoice } from '@socialista/types'

export const UGC_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Calm, clear American' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', description: 'Bold, young American' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Bella', description: 'Soft, conversational' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', description: 'Warm, well-rounded' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Expressive, upbeat' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', description: 'Deep, casual' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', description: 'Crisp narrator' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Confident, mid-range' },
] as const

export type UgcVoiceOption = (typeof UGC_VOICES)[number]

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
