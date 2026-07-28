import { z } from 'zod'

export const analyticsSweepPayloadSchema = z.object({
  /** Optional ISO timestamp; defaults to now. Used to derive the 12h bucket + slot. */
  timestamp: z.string().datetime().optional(),
  /**
   * Optional explicit slot override (0‥ANALYTICS_SLOT_COUNT-1).
   * When omitted, derived from `timestamp` / now within the current 12h window.
   */
  slotIndex: z.number().int().min(0).optional(),
  /**
   * When true, enqueue every eligible account (ignore slot hashing).
   * Use for local/manual testing — do not enable on the production 5-minute cron.
   */
  forceAll: z.boolean().optional(),
})

export type AnalyticsSweepPayload = z.infer<typeof analyticsSweepPayloadSchema>
