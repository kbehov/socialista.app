import { z } from 'zod'

export const generateUgcImageAdPayloadSchema = z.object({
  projectId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  clipId: z.string().min(1),
  prompt: z.string().optional(),
  language: z.string().optional(),
  aspectRatio: z.string().optional(),
  productImage: z.string().url().optional(),
})

export type GenerateUgcImageAdPayload = z.infer<typeof generateUgcImageAdPayloadSchema>
