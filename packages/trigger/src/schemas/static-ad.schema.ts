import {
  ASPECT_RATIOS,
  IMAGE_GENERATION_COUNT_DEFAULT,
  IMAGE_GENERATION_COUNT_MAX,
  IMAGE_GENERATION_COUNT_MIN,
  STATIC_AD_MODEL,
} from '@socialista/types'
import { z } from 'zod'

import { skillPayloadFields } from './skill-payload.js'

export const staticAdCopySchema = z.object({
  headline: z.string().max(40).optional(),
  subheadline: z.string().max(80).optional(),
  cta: z.string().max(20).optional(),
  brandName: z.string().max(30).optional(),
})

export const staticAdPayloadObjectSchema = z.object({
  prompt: z.string().trim().min(1).optional(),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  projectId: z.string().min(1).optional(),
  aspectRatio: z.enum(ASPECT_RATIOS).default('1:1'),
  productImage: z.string().url(),
  referenceImage: z.string().url().optional(),
  model: z.literal(STATIC_AD_MODEL).default(STATIC_AD_MODEL),
  language: z.string().default('en'),
  adCopy: staticAdCopySchema.optional(),
  numImages: z
    .number()
    .int()
    .min(IMAGE_GENERATION_COUNT_MIN)
    .max(IMAGE_GENERATION_COUNT_MAX)
    .default(IMAGE_GENERATION_COUNT_DEFAULT),
  ...skillPayloadFields,
})

export const staticAdPayloadSchema = staticAdPayloadObjectSchema

export type StaticAdGenerationPayload = z.infer<typeof staticAdPayloadSchema>
