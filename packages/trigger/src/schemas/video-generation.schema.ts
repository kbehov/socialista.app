import {
  VIDEO_ASPECT_RATIOS,
  VIDEO_DURATION_AUTO,
  VIDEO_DURATION_DEFAULT,
  VIDEO_DURATION_MAX,
  VIDEO_DURATION_MIN,
  VIDEO_RESOLUTION_DEFAULT,
} from '@socialista/types'
import { z } from 'zod'

import { skillPayloadFields } from './skill-payload.js'

export const videoGenerationPayloadSchema = z.object({
  model: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  projectId: z.string().min(1).optional(),
  prompt: z.string().min(1),
  aspectRatio: z.enum(VIDEO_ASPECT_RATIOS).default('9:16'),
  duration: z
    .union([
      z.number().int().min(VIDEO_DURATION_MIN).max(VIDEO_DURATION_MAX),
      z.literal(VIDEO_DURATION_AUTO),
    ])
    .default(VIDEO_DURATION_DEFAULT),
  generateAudio: z.boolean().default(true),
  resolution: z.string().min(1).default(VIDEO_RESOLUTION_DEFAULT),
  imageUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  enhance: z.boolean().optional(),
  ...skillPayloadFields,
})

export type VideoGenerationPayload = z.infer<typeof videoGenerationPayloadSchema>
