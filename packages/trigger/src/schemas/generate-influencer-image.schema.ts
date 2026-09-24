import {
  ASPECT_RATIOS,
  IMAGE_GENERATION_COUNT_MAX,
  IMAGE_GENERATION_COUNT_MIN,
} from '@socialista/types'
import { z } from 'zod'

export const generateInfluencerImagePayloadSchema = z.object({
  influencerId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  projectId: z.string().min(1).optional(),
  sourceImageUrl: z.string().url(),
  prompt: z.string().min(1),
  model: z.string().min(1),
  aspectRatio: z.enum(ASPECT_RATIOS),
  count: z.number().int().min(IMAGE_GENERATION_COUNT_MIN).max(IMAGE_GENERATION_COUNT_MAX),
})

export type GenerateInfluencerImagePayload = z.infer<typeof generateInfluencerImagePayloadSchema>
