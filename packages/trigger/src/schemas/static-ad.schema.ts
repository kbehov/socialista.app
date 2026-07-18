import { ASPECT_RATIOS, STATIC_AD_MODEL } from '@socialista/types'
import { z } from 'zod'

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
  aspectRatio: z.enum(ASPECT_RATIOS).default('1:1'),
  productImage: z.string().url(),
  model: z.literal(STATIC_AD_MODEL).default(STATIC_AD_MODEL),
  language: z.string().default('en'),
  adCopy: staticAdCopySchema.optional(),
})

export const staticAdPayloadSchema = staticAdPayloadObjectSchema

export type StaticAdGenerationPayload = z.infer<typeof staticAdPayloadSchema>
