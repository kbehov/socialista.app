import { z } from 'zod'

export const postAnalyticsSweepPayloadSchema = z.object({
  /** Optional ISO timestamp; defaults to now. Used for the hourly idempotency key. */
  timestamp: z.string().datetime().optional(),
})

export type PostAnalyticsSweepPayload = z.infer<typeof postAnalyticsSweepPayloadSchema>
