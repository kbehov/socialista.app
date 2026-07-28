/** 12h refresh window — each account is fetched once per window. */
export const ANALYTICS_REFRESH_WINDOW_MS = 12 * 60 * 60 * 1000

/** How often the sweep cron should tick (external cron interval). */
export const ANALYTICS_SLOT_INTERVAL_MS = 5 * 60 * 1000

/** Number of slots in one 12h window (144 × 5min). */
export const ANALYTICS_SLOT_COUNT = ANALYTICS_REFRESH_WINDOW_MS / ANALYTICS_SLOT_INTERVAL_MS

/**
 * Stable FNV-1a 32-bit hash of an account id → refresh slot in `[0, slotCount)`.
 * Spreads 100k accounts evenly across the rolling window.
 */
export function hashAccountRefreshSlot(
  accountId: string,
  slotCount: number = ANALYTICS_SLOT_COUNT,
): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < accountId.length; i++) {
    hash ^= accountId.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0) % slotCount
}

/** Floor `date` to the start of its 12h UTC bucket (00:00 or 12:00). */
export function floorToAnalyticsBucket(date: Date): Date {
  const d = new Date(date)
  d.setUTCMinutes(0, 0, 0)
  d.setUTCHours(d.getUTCHours() < 12 ? 0 : 12)
  return d
}

/** Floor `date` to UTC midnight — one snapshot document per account per calendar day. */
export function floorToUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
}

/**
 * Slot index for `now` within the current 12h bucket.
 * Slot 0 is the first 5 minutes after the bucket start; slot 143 is the last.
 */
export function currentAnalyticsSlotIndex(
  now: Date = new Date(),
  slotIntervalMs: number = ANALYTICS_SLOT_INTERVAL_MS,
  slotCount: number = ANALYTICS_SLOT_COUNT,
): number {
  const bucketStart = floorToAnalyticsBucket(now)
  const elapsed = Math.max(0, now.getTime() - bucketStart.getTime())
  return Math.min(Math.floor(elapsed / slotIntervalMs), slotCount - 1)
}
