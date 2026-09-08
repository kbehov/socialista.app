import { z } from 'zod'

import { skillPayloadFields } from './skill-payload.js'

export const generateUgcStillsPayloadSchema = z.object({
  projectId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  clipId: z.string().min(1).optional(),
  skipEnhance: z.boolean().optional(),
  prompt: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  referenceImageUrls: z.array(z.string().min(1)).max(8).optional(),
  count: z.number().int().min(1).max(3).optional(),
  ...skillPayloadFields,
})

export type GenerateUgcStillsPayload = z.infer<typeof generateUgcStillsPayloadSchema>
