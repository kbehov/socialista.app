export const DEFAULT_PAGE = 1
export const DEFAULT_PAGE_SIZE = 10
export const DEFAULT_SORT = '-createdAt'
/** Hard cap for post list/calendar queries — prevents unbounded reads under load. */
export const MAX_PAGE_SIZE = 250
/** Default and max page size for workspace account lists. */
export const DEFAULT_ACCOUNT_PAGE_SIZE = 50
export const MAX_ACCOUNT_PAGE_SIZE = 100
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
