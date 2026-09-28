import { SocialProvider } from '../types/account.types.js'
import { PostAnalyticsCheckpoint } from '../types/post-analytics.types.js'

const HOUR_MS = 60 * 60 * 1000

export const POST_ANALYTICS_PROVIDERS: SocialProvider[] = [
  SocialProvider.INSTAGRAM,
  SocialProvider.FACEBOOK,
]

export const POST_ANALYTICS_CHECKPOINTS: PostAnalyticsCheckpoint[] = [
  PostAnalyticsCheckpoint.H1,
  PostAnalyticsCheckpoint.H6,
  PostAnalyticsCheckpoint.H24,
  PostAnalyticsCheckpoint.H48,
  PostAnalyticsCheckpoint.H72,
  PostAnalyticsCheckpoint.D7,
  PostAnalyticsCheckpoint.D30,
]

export const POST_ANALYTICS_CHECKPOINT_HOURS: Record<PostAnalyticsCheckpoint, number> = {
  [PostAnalyticsCheckpoint.H1]: 1,
  [PostAnalyticsCheckpoint.H6]: 6,
  [PostAnalyticsCheckpoint.H24]: 24,
  [PostAnalyticsCheckpoint.H48]: 48,
  [PostAnalyticsCheckpoint.H72]: 72,
  [PostAnalyticsCheckpoint.D7]: 168,
  [PostAnalyticsCheckpoint.D30]: 720,
}

/** Extra time after the 30d checkpoint so the hourly cron can still catch it. */
export const POST_ANALYTICS_FINAL_GRACE_MS = 24 * HOUR_MS

export type PostAnalyticsScheduleDecision =
  | { kind: 'fetch'; checkpointKey: PostAnalyticsCheckpoint }
  | { kind: 'scheduled'; checkpointKey: PostAnalyticsCheckpoint; nextCheckpointAt: Date }
  | { kind: 'complete' }

export function isPostAnalyticsSupportedProvider(provider: SocialProvider): boolean {
  return POST_ANALYTICS_PROVIDERS.includes(provider)
}

export function postAnalyticsCheckpointHours(key: PostAnalyticsCheckpoint): number {
  return POST_ANALYTICS_CHECKPOINT_HOURS[key]
}

export function postAnalyticsCheckpointAt(
  publishedAt: Date,
  key: PostAnalyticsCheckpoint,
): Date {
  return new Date(publishedAt.getTime() + POST_ANALYTICS_CHECKPOINT_HOURS[key] * HOUR_MS)
}

export function nextPostAnalyticsCheckpoint(
  key: PostAnalyticsCheckpoint,
): PostAnalyticsCheckpoint | null {
  const index = POST_ANALYTICS_CHECKPOINTS.indexOf(key)
  if (index < 0 || index >= POST_ANALYTICS_CHECKPOINTS.length - 1) return null
  return POST_ANALYTICS_CHECKPOINTS[index + 1] ?? null
}

export function postAnalyticsWindowEnd(
  publishedAt: Date,
  key: PostAnalyticsCheckpoint,
): Date {
  const next = nextPostAnalyticsCheckpoint(key)
  if (next) return postAnalyticsCheckpointAt(publishedAt, next)
  return new Date(
    postAnalyticsCheckpointAt(publishedAt, key).getTime() + POST_ANALYTICS_FINAL_GRACE_MS,
  )
}

/** Oldest `publishedAt` still eligible for any remaining checkpoint (30d + grace). */
export function postAnalyticsOldestPublishedAt(now: Date): Date {
  const lastHours = POST_ANALYTICS_CHECKPOINT_HOURS[PostAnalyticsCheckpoint.D30]
  return new Date(now.getTime() - lastHours * HOUR_MS - POST_ANALYTICS_FINAL_GRACE_MS)
}

export function isPostAnalyticsWindowOpen(
  publishedAt: Date,
  key: PostAnalyticsCheckpoint,
  now: Date,
): boolean {
  const start = postAnalyticsCheckpointAt(publishedAt, key)
  const end = postAnalyticsWindowEnd(publishedAt, key)
  return now.getTime() >= start.getTime() && now.getTime() < end.getTime()
}

export function isPostAnalyticsCheckpoint(
  value: string | undefined,
): value is PostAnalyticsCheckpoint {
  return (
    typeof value === 'string' &&
    (POST_ANALYTICS_CHECKPOINTS as string[]).includes(value)
  )
}

/**
 * Decide whether `checkpointKey` should be fetched now, skipped forward, or closed.
 * Late lifetime totals are never stored under an earlier checkpoint label.
 */
export function resolvePostAnalyticsSchedule(
  publishedAt: Date,
  checkpointKey: PostAnalyticsCheckpoint,
  now: Date,
): PostAnalyticsScheduleDecision {
  let key: PostAnalyticsCheckpoint | null = checkpointKey

  while (key) {
    const start = postAnalyticsCheckpointAt(publishedAt, key)
    const end = postAnalyticsWindowEnd(publishedAt, key)

    if (now.getTime() < start.getTime()) {
      return { kind: 'scheduled', checkpointKey: key, nextCheckpointAt: start }
    }
    if (now.getTime() < end.getTime()) {
      return { kind: 'fetch', checkpointKey: key }
    }

    key = nextPostAnalyticsCheckpoint(key)
  }

  return { kind: 'complete' }
}

/**
 * First remaining checkpoint for a newly published or backfilled post.
 * Does not backfill missed windows with current lifetime totals.
 */
export function initialPostAnalyticsSchedule(
  publishedAt: Date,
  now: Date = new Date(),
): PostAnalyticsScheduleDecision {
  const first = POST_ANALYTICS_CHECKPOINTS[0]
  if (!first) return { kind: 'complete' }
  return resolvePostAnalyticsSchedule(publishedAt, first, now)
}

export function scheduleAfterPostAnalyticsSuccess(
  publishedAt: Date,
  completedKey: PostAnalyticsCheckpoint,
): PostAnalyticsScheduleDecision {
  const next = nextPostAnalyticsCheckpoint(completedKey)
  if (!next) return { kind: 'complete' }
  return {
    kind: 'scheduled',
    checkpointKey: next,
    nextCheckpointAt: postAnalyticsCheckpointAt(publishedAt, next),
  }
}
