import { z } from 'zod'

export const generateUgcStillsPayloadSchema = z.object({
  projectId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  clipId: z.string().min(1),
  stillIndex: z.number().int().min(0).max(2).optional(),
  skipEnhance: z.boolean().optional(),
})

export type GenerateUgcStillsPayload = z.infer<typeof generateUgcStillsPayloadSchema>
