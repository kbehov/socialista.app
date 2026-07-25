import { z } from 'zod'

export const analyticsSweepPayloadSchema = z.object({
  /** Optional ISO timestamp; defaults to now. Used to derive the 12h bucket. */
  timestamp: z.string().datetime().optional(),
})

export type AnalyticsSweepPayload = z.infer<typeof analyticsSweepPayloadSchema>
