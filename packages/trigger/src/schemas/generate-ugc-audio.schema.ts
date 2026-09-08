import { z } from 'zod'

export const generateUgcAudioPayloadSchema = z.object({
  projectId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  clipId: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
})

export type GenerateUgcAudioPayload = z.infer<typeof generateUgcAudioPayloadSchema>
