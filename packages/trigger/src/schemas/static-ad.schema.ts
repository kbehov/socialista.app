import {
  ASPECT_RATIOS,
  IMAGE_GENERATION_COUNT_DEFAULT,
  IMAGE_GENERATION_COUNT_MAX,
  IMAGE_GENERATION_COUNT_MIN,
  STATIC_AD_MODEL,
} from '@socialista/types'
import { z } from 'zod'

import { skillPayloadFields } from './skill-payload.js'

export const STATIC_AD_IMAGE_ROLES = ['product', 'influencer', 'template', 'upload', 'library'] as const
export const STATIC_AD_IMAGE_MAX = 10

export const staticAdImageSchema = z.object({
  url: z.string().url(),
  role: z.enum(STATIC_AD_IMAGE_ROLES).optional(),
  label: z.string().trim().max(80).optional(),
})

export type StaticAdImageInput = z.infer<typeof staticAdImageSchema>
export type StaticAdImageRole = (typeof STATIC_AD_IMAGE_ROLES)[number]

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
  images: z.array(staticAdImageSchema).max(STATIC_AD_IMAGE_MAX).optional(),
  productImage: z.string().url().optional(),
  referenceImage: z.string().url().optional(),
  model: z.string().min(1).default(STATIC_AD_MODEL),
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

export function resolveStaticAdImages(payload: {
  images?: StaticAdImageInput[]
  productImage?: string
  referenceImage?: string
}): StaticAdImageInput[] {
  if (payload.images && payload.images.length > 0) {
    return payload.images.slice(0, STATIC_AD_IMAGE_MAX)
  }

  const next: StaticAdImageInput[] = []
  if (payload.productImage) next.push({ url: payload.productImage, role: 'product' })
  if (payload.referenceImage && payload.referenceImage !== payload.productImage) {
    next.push({ url: payload.referenceImage, role: 'template' })
  }
  return next
}

export const staticAdPayloadSchema = staticAdPayloadObjectSchema

export type StaticAdGenerationPayload = z.infer<typeof staticAdPayloadSchema>
