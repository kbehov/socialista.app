import { z } from 'zod'

export const fetchAccountAnalyticsPayloadSchema = z.object({
  accountId: z.string().min(1),
  /** ISO string of the UTC calendar-day bucket start (00:00). */
  bucketAt: z.string().datetime(),
  /** True for the morning half / forceAll — fetch flow metrics for the prior 24h window. */
  includeFlows: z.boolean(),
})

export type FetchAccountAnalyticsPayload = z.infer<typeof fetchAccountAnalyticsPayloadSchema>
