import { z } from 'zod'

export const refreshAccountTokenPayloadSchema = z.object({
  accountId: z.string().min(1),
})

export type RefreshAccountTokenPayload = z.infer<typeof refreshAccountTokenPayloadSchema>
