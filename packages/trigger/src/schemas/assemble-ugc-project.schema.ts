import { z } from 'zod'

export const assembleUgcProjectPayloadSchema = z.object({
  projectId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
})

export type AssembleUgcProjectPayload = z.infer<typeof assembleUgcProjectPayloadSchema>
