import { z } from 'zod'

export const fetchAccountAnalyticsPayloadSchema = z.object({
  accountId: z.string().min(1),
  /** ISO string of the 12h UTC bucket start. */
  bucketAt: z.string().datetime(),
  /** True for the 00:00 UTC run — fetch flow metrics for the prior 24h window. */
  includeFlows: z.boolean(),
})

export type FetchAccountAnalyticsPayload = z.infer<typeof fetchAccountAnalyticsPayloadSchema>
