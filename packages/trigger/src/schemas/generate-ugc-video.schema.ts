import { z } from 'zod'

export const generateUgcVideoPayloadSchema = z.object({
  projectId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  clipId: z.string().min(1),
  plannedPrompt: z.string().min(1).optional(),
  skipPlanner: z.boolean().optional(),
})

export type GenerateUgcVideoPayload = z.infer<typeof generateUgcVideoPayloadSchema>
