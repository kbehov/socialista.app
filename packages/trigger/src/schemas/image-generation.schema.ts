import {
  ASPECT_RATIOS,
  IMAGE_GENERATION_COUNT_DEFAULT,
  IMAGE_GENERATION_COUNT_MAX,
  IMAGE_GENERATION_COUNT_MIN,
} from '@socialista/types'
import { z } from 'zod'

import { skillPayloadFields } from './skill-payload.js'

export const imageGenerationPayloadSchema = z.object({
  model: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  prompt: z.string().min(1),
  aspectRatio: z.enum(ASPECT_RATIOS).default('1:1'),
  imageUrl: z.string().url().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  numImages: z
    .number()
    .int()
    .min(IMAGE_GENERATION_COUNT_MIN)
    .max(IMAGE_GENERATION_COUNT_MAX)
    .default(IMAGE_GENERATION_COUNT_DEFAULT),
  ...skillPayloadFields,
})

export type ImageGenerationPayload = z.infer<typeof imageGenerationPayloadSchema>
