import {
  VIDEO_ASPECT_RATIOS,
  VIDEO_DURATION_AUTO,
  VIDEO_DURATION_DEFAULT,
  VIDEO_DURATION_MAX,
  VIDEO_DURATION_MIN,
  VIDEO_RESOLUTION_DEFAULT,
} from '@socialista/types'
import { z } from 'zod'

export const videoGenerationPayloadSchema = z.object({
  prompt: z.string().min(1),
  model: z.string().min(1),
  provider: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  aspectRatio: z.enum(VIDEO_ASPECT_RATIOS).default('9:16'),
  duration: z
    .union([
      z.number().int().min(VIDEO_DURATION_MIN).max(VIDEO_DURATION_MAX),
      z.literal(VIDEO_DURATION_AUTO),
    ])
    .default(VIDEO_DURATION_DEFAULT)
    .transform(value => (value === VIDEO_DURATION_AUTO ? undefined : value)),
  generateAudio: z.boolean().default(true),
  resolution: z.string().min(1).default(VIDEO_RESOLUTION_DEFAULT),
  imageUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  videoUrls: z.array(z.string().url()).optional(),
})

export type VideoGenerationPayload = z.input<typeof videoGenerationPayloadSchema>
