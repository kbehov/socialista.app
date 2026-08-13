import { z } from 'zod'

export const generateUgcVideoPayloadSchema = z.object({
  projectId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  variantIds: z.array(z.string().min(1)).max(3).optional(),
  plannedPrompt: z.string().min(1).optional(),
  skipPlanner: z.boolean().optional(),
})

export type GenerateUgcVideoPayload = z.infer<typeof generateUgcVideoPayloadSchema>
