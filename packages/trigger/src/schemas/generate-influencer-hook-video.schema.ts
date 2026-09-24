import {
  INFLUENCER_HOOK_VIDEO_COUNT_MAX,
  INFLUENCER_HOOK_VIDEO_COUNT_MIN,
  VIDEO_DURATION_DEFAULT,
  VIDEO_DURATION_MAX,
  VIDEO_DURATION_MIN,
} from '@socialista/types'
import { z } from 'zod'

export const generateInfluencerHookVideoPayloadSchema = z.object({
  influencerId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  projectId: z.string().min(1).optional(),
  sourceImageUrl: z.string().url(),
  prompt: z.string().min(1),
  model: z.string().min(1),
  duration: z
    .number()
    .int()
    .min(VIDEO_DURATION_MIN)
    .max(VIDEO_DURATION_MAX)
    .default(VIDEO_DURATION_DEFAULT),
  count: z.number().int().min(INFLUENCER_HOOK_VIDEO_COUNT_MIN).max(INFLUENCER_HOOK_VIDEO_COUNT_MAX),
  presetId: z.string().min(1).optional(),
})

export type GenerateInfluencerHookVideoPayload = z.infer<
  typeof generateInfluencerHookVideoPayloadSchema
>
