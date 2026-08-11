import { z } from 'zod'
import { INFLUENCER_SHOT_PACKS } from '@socialista/types'

export const generateInfluencerPayloadSchema = z.object({
  influencerId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  model: z.string().min(1),
  shotPack: z.enum(INFLUENCER_SHOT_PACKS).default('quick'),
})

export type GenerateInfluencerPayload = z.infer<typeof generateInfluencerPayloadSchema>
