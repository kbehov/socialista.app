import { VIDEO_AUDIO_MAX_CHARS } from '@socialista/types'
import { z } from 'zod'

export const generateAudioVoiceSchema = z.object({
  voiceId: z.string().min(1),
  voiceName: z.string().optional(),
  speed: z.number().optional(),
  stability: z.number().optional(),
  similarity: z.number().optional(),
  style: z.number().optional(),
  speakerBoost: z.boolean().optional(),
})

export const generateAudioPayloadSchema = z.object({
  videoId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  text: z.string().min(1).max(VIDEO_AUDIO_MAX_CHARS),
  model: z.string().min(1),
  voice: generateAudioVoiceSchema,
})

export type GenerateAudioPayload = z.infer<typeof generateAudioPayloadSchema>
