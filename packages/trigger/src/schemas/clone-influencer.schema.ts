import { z } from 'zod'

export const cloneInfluencerPayloadSchema = z.object({
  cloneRequestId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  model: z.string().min(1),
})

export type CloneInfluencerPayload = z.infer<typeof cloneInfluencerPayloadSchema>
