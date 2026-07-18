import { ASPECT_RATIOS } from '@socialista/types'
import { z } from 'zod'

export const imageGenerationPayloadSchema = z.object({
  prompt: z.string().min(1),
  model: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  aspectRatio: z.enum(ASPECT_RATIOS).default('1:1'),
  imageUrl: z.string().url().optional(),
})

export type ImageGenerationPayload = z.infer<typeof imageGenerationPayloadSchema>

/** @deprecated Use `imageGenerationPayloadSchema` */
export const payloadSchema = imageGenerationPayloadSchema
