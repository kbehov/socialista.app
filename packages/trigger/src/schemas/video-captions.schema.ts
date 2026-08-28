import { z } from 'zod'

export const videoCaptionsPayloadSchema = z.object({
  videoId: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  clipId: z.string().min(1),
})

export type VideoCaptionsPayload = z.infer<typeof videoCaptionsPayloadSchema>
