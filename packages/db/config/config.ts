export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_SORT = '-createdAt'
/** Hard cap for post list/calendar queries — prevents unbounded reads under load. */
export const MAX_PAGE_SIZE = 250
/** Default page size for workspace account lists. */
export const DEFAULT_ACCOUNT_PAGE_SIZE = 50
/** Default batch size for claiming due posts in one cron tick chunk. */
export const DEFAULT_PUBLISH_CLAIM_BATCH_SIZE = 200
/** Hard cap per claim batch — aligned with Trigger.dev batchTrigger max (1000). */
export const MAX_PUBLISH_CLAIM_BATCH_SIZE = 1000
/** Max posts claimed (and enqueued) across all chunks in one cron invocation. */
export const MAX_PUBLISH_CLAIM_PER_TICK = 5000
/**
 * Publishing claims that never started a Trigger run can be redispatched after this age.
 * Keep short enough that crashes recover quickly, long enough to avoid racing in-flight enqueue.
 */
export const STALE_PUBLISH_CLAIM_MS = 5 * 60 * 1000

/** Default batch size when claiming due post-analytics checkpoints in one sweep page. */
export const DEFAULT_POST_ANALYTICS_CLAIM_BATCH_SIZE = 200
/** Hard cap per claim page — aligned with Trigger.dev batchTrigger max (1000). */
export const MAX_POST_ANALYTICS_CLAIM_BATCH_SIZE = 1000
/** Max posts claimed, advanced, or backfilled across one hourly sweep. */
export const MAX_POST_ANALYTICS_CLAIM_PER_TICK = 5000
/** Posts per fetch-post-analytics task (same account + checkpoint). */
export const POST_ANALYTICS_POSTS_PER_TASK = 20
/** Skip a checkpoint (no snapshot) after this many failed fetch attempts. */
export const POST_ANALYTICS_MAX_FAILURES = 5
/** Lease length so the next hourly tick does not re-claim in-flight posts. */
export const POST_ANALYTICS_LEASE_MS = 2 * 60 * 60 * 1000
/** Retry the same checkpoint after a transient failure. */
export const POST_ANALYTICS_RETRY_DELAY_MS = 60 * 60 * 1000
