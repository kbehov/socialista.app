import { z } from 'zod'

export const generateUgcStillsPayloadSchema = z.object({
  projectId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  variantIds: z.array(z.string().min(1)).max(3).optional(),
  stillIndex: z.number().int().min(0).max(2).optional(),
})

export type GenerateUgcStillsPayload = z.infer<typeof generateUgcStillsPayloadSchema>
