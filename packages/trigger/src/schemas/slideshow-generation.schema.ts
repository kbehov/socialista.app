import {
  SLIDESHOW_GENERATION_SLIDE_COUNT_MAX,
  SLIDESHOW_GENERATION_SLIDE_COUNT_MIN,
} from '@socialista/types'
import { z } from 'zod'

import { skillPayloadFields } from './skill-payload.js'

export const slideshowGenerationPayloadSchema = z.object({
  model: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  projectId: z.string().min(1).optional(),
  prompt: z.string().min(1),
  slideCount: z
    .number()
    .int()
    .min(SLIDESHOW_GENERATION_SLIDE_COUNT_MIN)
    .max(SLIDESHOW_GENERATION_SLIDE_COUNT_MAX)
    .optional(),
  aspectRatioId: z.string().min(1),
  canvas: z.object({
    width: z.number().int().positive(),
    height: z.number().int().positive(),
  }),
  textModel: z.string().min(1).optional(),
  ...skillPayloadFields,
})

export type SlideshowGenerationPayload = z.infer<typeof slideshowGenerationPayloadSchema>
