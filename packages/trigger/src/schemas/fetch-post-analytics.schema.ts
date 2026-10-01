import { POST_ANALYTICS_POSTS_PER_TASK } from '@socialista/db'
import { z } from 'zod'

export const POST_ANALYTICS_CHECKPOINT_KEYS = [
  '1h',
  '6h',
  '24h',
  '48h',
  '72h',
  '7d',
  '30d',
] as const

export const fetchPostAnalyticsPayloadSchema = z.object({
  accountId: z.string().min(1),
  checkpointKey: z.enum(POST_ANALYTICS_CHECKPOINT_KEYS),
  posts: z
    .array(
      z.object({
        postId: z.string().min(1),
        providerPostId: z.string().min(1),
      }),
    )
    .min(1)
    .max(POST_ANALYTICS_POSTS_PER_TASK),
})

export type FetchPostAnalyticsPayload = z.infer<typeof fetchPostAnalyticsPayloadSchema>
