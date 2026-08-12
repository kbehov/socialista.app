import { z } from 'zod'

export const generateInfluencerPayloadSchema = z.object({
  influencerId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  model: z.string().min(1),
})

export type GenerateInfluencerPayload = z.infer<typeof generateInfluencerPayloadSchema>
