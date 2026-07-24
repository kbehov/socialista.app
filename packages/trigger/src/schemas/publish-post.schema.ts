import { z } from 'zod'

export const publishPostPayloadSchema = z.object({
  postId: z.string().min(1),
  accountId: z.string().min(1),
  scheduleRevision: z.number().int().nonnegative(),
  claimToken: z.string().min(1),
})

export type PublishPostPayload = z.infer<typeof publishPostPayloadSchema>
