import { AccountAnalyticsSnapshotModel } from '../models/account-analytics-snapshot.model.js'
import type {
  AccountAnalyticsSeriesPoint,
  AnalyticsGranularity,
  UpsertAnalyticsSnapshotInput,
  WorkspaceAccountBreakdownRow,
  WorkspaceProviderBreakdownRow,
  WorkspaceProviderSeriesGroup,
} from '../types/account-analytics.types.js'
import type { SocialProvider } from '../types/account.types.js'
import { toObjectId } from '../utils/isValid.js'

const UNIT_MAP: Record<AnalyticsGranularity, 'day' | 'week' | 'month'> = {
  day: 'day',
  week: 'week',
  month: 'month',
}

function sumMetric(values: Array<number | null | undefined>): number | null {
  let total = 0
  let sawValue = false
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      total += value
      sawValue = true
    }
  }
  return sawValue ? total : null
}

function lastMetric(values: Array<number | null | undefined>): number | null {
  for (let i = values.length - 1; i >= 0; i--) {
    const value = values[i]
    if (typeof value === 'number' && Number.isFinite(value)) return value
  }
  return null
}

function firstMetric(values: Array<number | null | undefined>): number | null {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) return value
  }
  return null
}

const GAUGE_METRIC_KEYS = ['followerCount', 'followingCount', 'postsCount'] as const

/** Idempotent upsert keyed on (account, UTC-day bucketAt). Midday gauge runs merge into the same day. */
export const upsertAnalyticsSnapshot = async (input: UpsertAnalyticsSnapshotInput) => {
  const accountId = toObjectId(input.accountId)
  const bucketAt = input.bucketAt
  const dayStart = new Date(
    Date.UTC(bucketAt.getUTCFullYear(), bucketAt.getUTCMonth(), bucketAt.getUTCDate(), 0, 0, 0, 0),
  )
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)

  const $set: Record<string, unknown> = {
    workspace: toObjectId(input.workspaceId),
    account: accountId,
    provider: input.provider,
    bucketAt: dayStart,
    capturedAt: input.capturedAt,
  }

  const update: Record<string, unknown> = { $set }

  if (input.isDailyAnchor) {
    // Full replace for the daily flow window (views/reach/engagement/…).
    $set.isDailyAnchor = true
    $set.metrics = input.metrics
    $set.missingMetrics = input.missingMetrics ?? []
    if (input.windowStart) $set.windowStart = input.windowStart
    if (input.windowEnd) $set.windowEnd = input.windowEnd
    if (input.raw !== undefined) $set.raw = input.raw
  } else {
    // Gauges-only: merge into the same day's doc without wiping existing flow metrics.
    for (const key of GAUGE_METRIC_KEYS) {
      const value = input.metrics[key]
      if (typeof value === 'number' && Number.isFinite(value)) {
        $set[`metrics.${key}`] = value
      }
    }
    if (input.raw !== undefined) $set.raw = input.raw
    update.$setOnInsert = {
      isDailyAnchor: false,
      missingMetrics: input.missingMetrics ?? [],
    }
  }

  const doc = await AccountAnalyticsSnapshotModel.findOneAndUpdate(
    { account: accountId, bucketAt: dayStart },
    update,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean()

  // Remove legacy same-day siblings (e.g. old 12:00 UTC half-bucket docs).
  if (doc?._id) {
    await AccountAnalyticsSnapshotModel.deleteMany({
      account: accountId,
      bucketAt: { $gte: dayStart, $lt: dayEnd },
      _id: { $ne: doc._id },
    })
  }

  return doc
}

type SeriesQuery = {
  accountId: string
  start: Date
  end: Date
  granularity: AnalyticsGranularity
}

/**
 * Aggregate snapshots for one account into chart-ready points.
 * Gauges (followers/following/posts) use the latest value in the bucket.
 * Flows (views/reach/engagement/…) sum only daily-anchor docs to avoid double-counting.
 */
export const getAccountAnalyticsSeries = async (
  query: SeriesQuery,
): Promise<AccountAnalyticsSeriesPoint[]> => {
  const unit = UNIT_MAP[query.granularity]

  const rows = await AccountAnalyticsSnapshotModel.aggregate<{
    _id: Date
    followerCounts: Array<number | null>
    followingCounts: Array<number | null>
    postsCounts: Array<number | null>
    views: Array<number | null>
    reach: Array<number | null>
    likes: Array<number | null>
    comments: Array<number | null>
    shares: Array<number | null>
    saves: Array<number | null>
    engagements: Array<number | null>
    engagementRates: Array<number | null>
  }>([
    {
      $match: {
        account: toObjectId(query.accountId),
        bucketAt: { $gte: query.start, $lt: query.end },
      },
    },
    { $sort: { bucketAt: 1 } },
    {
      $group: {
        _id: {
          $dateTrunc: { date: '$bucketAt', unit },
        },
        followerCounts: { $push: '$metrics.followerCount' },
        followingCounts: { $push: '$metrics.followingCount' },
        postsCounts: { $push: '$metrics.postsCount' },
        views: {
          $push: {
            $cond: [{ $eq: ['$isDailyAnchor', true] }, '$metrics.views', null],
          },
        },
        reach: {
          $push: {
            $cond: [{ $eq: ['$isDailyAnchor', true] }, '$metrics.reach', null],
          },
        },
        likes: {
          $push: {
            $cond: [{ $eq: ['$isDailyAnchor', true] }, '$metrics.likes', null],
          },
        },
        comments: {
          $push: {
            $cond: [{ $eq: ['$isDailyAnchor', true] }, '$metrics.comments', null],
          },
        },
        shares: {
          $push: {
            $cond: [{ $eq: ['$isDailyAnchor', true] }, '$metrics.shares', null],
          },
        },
        saves: {
          $push: {
            $cond: [{ $eq: ['$isDailyAnchor', true] }, '$metrics.saves', null],
          },
        },
        engagements: {
          $push: {
            $cond: [{ $eq: ['$isDailyAnchor', true] }, '$metrics.engagement', null],
          },
        },
        engagementRates: {
          $push: {
            $cond: [{ $eq: ['$isDailyAnchor', true] }, '$metrics.engagementRate', null],
          },
        },
      },
    },
    { $sort: { _id: 1 } },
  ])

  return rows.map(row => ({
    date: row._id,
    followerCount: lastMetric(row.followerCounts),
    followingCount: lastMetric(row.followingCounts),
    postsCount: lastMetric(row.postsCounts),
    views: sumMetric(row.views),
    reach: sumMetric(row.reach),
    likes: sumMetric(row.likes),
    comments: sumMetric(row.comments),
    shares: sumMetric(row.shares),
    saves: sumMetric(row.saves),
    engagement: sumMetric(row.engagements),
    engagementRate: lastMetric(row.engagementRates),
  }))
}

type WorkspaceSeriesQuery = {
  workspaceId: string
  start: Date
  end: Date
  granularity: AnalyticsGranularity
}

/** Workspace-level series: sum gauges/flows across accounts per date bucket. */
export const getWorkspaceAnalyticsSeries = async (
  query: WorkspaceSeriesQuery,
): Promise<AccountAnalyticsSeriesPoint[]> => {
  const unit = UNIT_MAP[query.granularity]

  const rows = await AccountAnalyticsSnapshotModel.aggregate<{
    _id: Date
    followerCounts: Array<number | null>
    followingCounts: Array<number | null>
    postsCounts: Array<number | null>
    views: number
    reach: number
    likes: number
    comments: number
    shares: number
    saves: number
    engagement: number
    hasViews: number
    hasReach: number
    hasEngagement: number
  }>([
    {
      $match: {
        workspace: toObjectId(query.workspaceId),
        bucketAt: { $gte: query.start, $lt: query.end },
      },
    },
    { $sort: { bucketAt: 1 } },
    {
      $group: {
        _id: {
          date: { $dateTrunc: { date: '$bucketAt', unit } },
          account: '$account',
        },
        followerCount: { $last: '$metrics.followerCount' },
        followingCount: { $last: '$metrics.followingCount' },
        postsCount: { $last: '$metrics.postsCount' },
        views: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.views', null] }] },
              '$metrics.views',
              0,
            ],
          },
        },
        reach: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.reach', null] }] },
              '$metrics.reach',
              0,
            ],
          },
        },
        likes: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.likes', null] }] },
              '$metrics.likes',
              0,
            ],
          },
        },
        comments: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.comments', null] }] },
              '$metrics.comments',
              0,
            ],
          },
        },
        shares: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.shares', null] }] },
              '$metrics.shares',
              0,
            ],
          },
        },
        saves: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.saves', null] }] },
              '$metrics.saves',
              0,
            ],
          },
        },
        engagement: {
          $sum: {
            $cond: [
              {
                $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.engagement', null] }],
              },
              '$metrics.engagement',
              0,
            ],
          },
        },
        hasViews: {
          $max: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.views', null] }] },
              1,
              0,
            ],
          },
        },
        hasReach: {
          $max: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.reach', null] }] },
              1,
              0,
            ],
          },
        },
        hasEngagement: {
          $max: {
            $cond: [
              {
                $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.engagement', null] }],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $group: {
        _id: '$_id.date',
        followerCounts: { $push: '$followerCount' },
        followingCounts: { $push: '$followingCount' },
        postsCounts: { $push: '$postsCount' },
        views: { $sum: { $cond: [{ $eq: ['$hasViews', 1] }, '$views', 0] } },
        reach: { $sum: { $cond: [{ $eq: ['$hasReach', 1] }, '$reach', 0] } },
        likes: { $sum: '$likes' },
        comments: { $sum: '$comments' },
        shares: { $sum: '$shares' },
        saves: { $sum: '$saves' },
        engagement: { $sum: { $cond: [{ $eq: ['$hasEngagement', 1] }, '$engagement', 0] } },
        hasViews: { $max: '$hasViews' },
        hasReach: { $max: '$hasReach' },
        hasEngagement: { $max: '$hasEngagement' },
      },
    },
    { $sort: { _id: 1 } },
  ])

  return rows.map(row => ({
    date: row._id,
    followerCount: sumMetric(row.followerCounts),
    followingCount: sumMetric(row.followingCounts),
    postsCount: sumMetric(row.postsCounts),
    views: row.hasViews ? row.views : null,
    reach: row.hasReach ? row.reach : null,
    likes: row.likes,
    comments: row.comments,
    shares: row.shares,
    saves: row.saves,
    engagement: row.hasEngagement ? row.engagement : null,
    engagementRate: null,
  }))
}

type BreakdownQuery = {
  workspaceId: string
  currentStart: Date
  currentEnd: Date
  previousStart: Date
  previousEnd: Date
}

/** Per-account totals for the current and previous periods (for summary table). */
export const getWorkspaceAccountBreakdown = async (
  query: BreakdownQuery,
): Promise<WorkspaceAccountBreakdownRow[]> => {
  const rows = await AccountAnalyticsSnapshotModel.aggregate<{
    _id: unknown
    currentFollowerCounts: Array<number | null>
    currentFollowingCounts: Array<number | null>
    currentPostsCounts: Array<number | null>
    previousFollowerCounts: Array<number | null>
    currentViews: number
    currentReach: number
    currentLikes: number
    currentComments: number
    currentShares: number
    currentSaves: number
    currentEngagement: number
    hasViews: number
    hasReach: number
    hasEngagement: number
    hasCurrentFollowers: number
    hasPreviousFollowers: number
  }>([
    {
      $match: {
        workspace: toObjectId(query.workspaceId),
        bucketAt: { $gte: query.previousStart, $lt: query.currentEnd },
      },
    },
    { $sort: { bucketAt: 1 } },
    {
      $group: {
        _id: '$account',
        currentFollowerCounts: {
          $push: {
            $cond: [
              {
                $and: [
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                ],
              },
              '$metrics.followerCount',
              null,
            ],
          },
        },
        currentFollowingCounts: {
          $push: {
            $cond: [
              {
                $and: [
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                ],
              },
              '$metrics.followingCount',
              null,
            ],
          },
        },
        currentPostsCounts: {
          $push: {
            $cond: [
              {
                $and: [
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                ],
              },
              '$metrics.postsCount',
              null,
            ],
          },
        },
        previousFollowerCounts: {
          $push: {
            $cond: [
              {
                $and: [
                  { $gte: ['$bucketAt', query.previousStart] },
                  { $lt: ['$bucketAt', query.previousEnd] },
                ],
              },
              '$metrics.followerCount',
              null,
            ],
          },
        },
        currentViews: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.views', null] },
                ],
              },
              '$metrics.views',
              0,
            ],
          },
        },
        currentReach: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.reach', null] },
                ],
              },
              '$metrics.reach',
              0,
            ],
          },
        },
        currentLikes: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.likes', null] },
                ],
              },
              '$metrics.likes',
              0,
            ],
          },
        },
        currentComments: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.comments', null] },
                ],
              },
              '$metrics.comments',
              0,
            ],
          },
        },
        currentShares: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.shares', null] },
                ],
              },
              '$metrics.shares',
              0,
            ],
          },
        },
        currentSaves: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.saves', null] },
                ],
              },
              '$metrics.saves',
              0,
            ],
          },
        },
        currentEngagement: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.engagement', null] },
                ],
              },
              '$metrics.engagement',
              0,
            ],
          },
        },
        hasViews: {
          $max: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.views', null] },
                ],
              },
              1,
              0,
            ],
          },
        },
        hasReach: {
          $max: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.reach', null] },
                ],
              },
              1,
              0,
            ],
          },
        },
        hasEngagement: {
          $max: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.engagement', null] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
  ])

  return rows.map(row => {
    const followerCount = lastMetric(row.currentFollowerCounts)
    const previousFollowerCount = lastMetric(row.previousFollowerCounts)
    const firstFollower = firstMetric(row.currentFollowerCounts)
    const firstPosts = firstMetric(row.currentPostsCounts)
    const lastPosts = lastMetric(row.currentPostsCounts)
    const postsDelta =
      typeof firstPosts === 'number' && typeof lastPosts === 'number'
        ? Math.max(0, lastPosts - firstPosts)
        : lastPosts

    return {
      accountId: String(row._id),
      followerCount,
      followingCount: lastMetric(row.currentFollowingCounts),
      postsCount: postsDelta,
      views: row.hasViews ? row.currentViews : null,
      reach: row.hasReach ? row.currentReach : null,
      likes: row.currentLikes || null,
      comments: row.currentComments || null,
      shares: row.currentShares || null,
      saves: row.currentSaves || null,
      engagement: row.hasEngagement ? row.currentEngagement : null,
      previousFollowerCount:
        previousFollowerCount ??
        (typeof firstFollower === 'number' ? firstFollower : null),
    }
  })
}

/** Latest missingMetrics from the newest snapshot for an account (for dataQuality). */
export const getLatestMissingMetrics = async (accountId: string): Promise<string[]> => {
  const latest = await AccountAnalyticsSnapshotModel.findOne({ account: toObjectId(accountId) })
    .sort({ bucketAt: -1 })
    .select({ missingMetrics: 1 })
    .lean()
  return latest?.missingMetrics ?? []
}

type ProviderSeriesQuery = {
  workspaceId: string
  start: Date
  end: Date
  granularity: AnalyticsGranularity
}

/**
 * Per-provider workspace series in one pass.
 * Stage 1 groups by (date, account, provider); stage 2 rolls up to (date, provider).
 */
export const getWorkspaceProviderSeries = async (
  query: ProviderSeriesQuery,
): Promise<WorkspaceProviderSeriesGroup[]> => {
  const unit = UNIT_MAP[query.granularity]

  const rows = await AccountAnalyticsSnapshotModel.aggregate<{
    _id: { date: Date; provider: SocialProvider }
    followerCounts: Array<number | null>
    followingCounts: Array<number | null>
    postsCounts: Array<number | null>
    views: number
    reach: number
    likes: number
    comments: number
    shares: number
    saves: number
    engagement: number
    hasViews: number
    hasReach: number
    hasEngagement: number
  }>([
    {
      $match: {
        workspace: toObjectId(query.workspaceId),
        bucketAt: { $gte: query.start, $lt: query.end },
      },
    },
    { $sort: { bucketAt: 1 } },
    {
      $group: {
        _id: {
          date: { $dateTrunc: { date: '$bucketAt', unit } },
          account: '$account',
          provider: '$provider',
        },
        followerCount: { $last: '$metrics.followerCount' },
        followingCount: { $last: '$metrics.followingCount' },
        postsCount: { $last: '$metrics.postsCount' },
        views: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.views', null] }] },
              '$metrics.views',
              0,
            ],
          },
        },
        reach: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.reach', null] }] },
              '$metrics.reach',
              0,
            ],
          },
        },
        likes: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.likes', null] }] },
              '$metrics.likes',
              0,
            ],
          },
        },
        comments: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.comments', null] }] },
              '$metrics.comments',
              0,
            ],
          },
        },
        shares: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.shares', null] }] },
              '$metrics.shares',
              0,
            ],
          },
        },
        saves: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.saves', null] }] },
              '$metrics.saves',
              0,
            ],
          },
        },
        engagement: {
          $sum: {
            $cond: [
              {
                $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.engagement', null] }],
              },
              '$metrics.engagement',
              0,
            ],
          },
        },
        hasViews: {
          $max: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.views', null] }] },
              1,
              0,
            ],
          },
        },
        hasReach: {
          $max: {
            $cond: [
              { $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.reach', null] }] },
              1,
              0,
            ],
          },
        },
        hasEngagement: {
          $max: {
            $cond: [
              {
                $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: ['$metrics.engagement', null] }],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $group: {
        _id: { date: '$_id.date', provider: '$_id.provider' },
        followerCounts: { $push: '$followerCount' },
        followingCounts: { $push: '$followingCount' },
        postsCounts: { $push: '$postsCount' },
        views: { $sum: { $cond: [{ $eq: ['$hasViews', 1] }, '$views', 0] } },
        reach: { $sum: { $cond: [{ $eq: ['$hasReach', 1] }, '$reach', 0] } },
        likes: { $sum: '$likes' },
        comments: { $sum: '$comments' },
        shares: { $sum: '$shares' },
        saves: { $sum: '$saves' },
        engagement: { $sum: { $cond: [{ $eq: ['$hasEngagement', 1] }, '$engagement', 0] } },
        hasViews: { $max: '$hasViews' },
        hasReach: { $max: '$hasReach' },
        hasEngagement: { $max: '$hasEngagement' },
      },
    },
    { $sort: { '_id.provider': 1, '_id.date': 1 } },
  ])

  const byProvider = new Map<SocialProvider, AccountAnalyticsSeriesPoint[]>()

  for (const row of rows) {
    const point: AccountAnalyticsSeriesPoint = {
      date: row._id.date,
      followerCount: sumMetric(row.followerCounts),
      followingCount: sumMetric(row.followingCounts),
      postsCount: sumMetric(row.postsCounts),
      views: row.hasViews ? row.views : null,
      reach: row.hasReach ? row.reach : null,
      likes: row.likes,
      comments: row.comments,
      shares: row.shares,
      saves: row.saves,
      engagement: row.hasEngagement ? row.engagement : null,
      engagementRate: null,
    }

    const existing = byProvider.get(row._id.provider)
    if (existing) {
      existing.push(point)
    } else {
      byProvider.set(row._id.provider, [point])
    }
  }

  return Array.from(byProvider.entries()).map(([provider, points]) => ({
    provider,
    points,
  }))
}

type ProviderBreakdownQuery = {
  workspaceId: string
  currentStart: Date
  currentEnd: Date
  previousStart: Date
  previousEnd: Date
}

/** Per-provider totals for current and previous periods (side-by-side platform comparison). */
export const getWorkspaceProviderBreakdown = async (
  query: ProviderBreakdownQuery,
): Promise<WorkspaceProviderBreakdownRow[]> => {
  const rows = await AccountAnalyticsSnapshotModel.aggregate<{
    _id: SocialProvider
    accountCount: number
    currentFollowerCounts: Array<number | null>
    currentFollowingCounts: Array<number | null>
    currentPostsDeltas: Array<number | null>
    previousFollowerCounts: Array<number | null>
    previousPostsDeltas: Array<number | null>
    currentViews: number
    currentReach: number
    currentLikes: number
    currentComments: number
    currentShares: number
    currentSaves: number
    currentEngagement: number
    previousViews: number
    previousReach: number
    previousEngagement: number
    hasViews: number
    hasReach: number
    hasEngagement: number
    hasPreviousViews: number
    hasPreviousReach: number
    hasPreviousEngagement: number
  }>([
    {
      $match: {
        workspace: toObjectId(query.workspaceId),
        bucketAt: { $gte: query.previousStart, $lt: query.currentEnd },
      },
    },
    { $sort: { bucketAt: 1 } },
    {
      $group: {
        _id: {
          provider: '$provider',
          account: '$account',
        },
        currentFollowerCounts: {
          $push: {
            $cond: [
              {
                $and: [
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                ],
              },
              '$metrics.followerCount',
              null,
            ],
          },
        },
        currentFollowingCounts: {
          $push: {
            $cond: [
              {
                $and: [
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                ],
              },
              '$metrics.followingCount',
              null,
            ],
          },
        },
        currentPostsCounts: {
          $push: {
            $cond: [
              {
                $and: [
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                ],
              },
              '$metrics.postsCount',
              null,
            ],
          },
        },
        previousFollowerCounts: {
          $push: {
            $cond: [
              {
                $and: [
                  { $gte: ['$bucketAt', query.previousStart] },
                  { $lt: ['$bucketAt', query.previousEnd] },
                ],
              },
              '$metrics.followerCount',
              null,
            ],
          },
        },
        previousPostsCounts: {
          $push: {
            $cond: [
              {
                $and: [
                  { $gte: ['$bucketAt', query.previousStart] },
                  { $lt: ['$bucketAt', query.previousEnd] },
                ],
              },
              '$metrics.postsCount',
              null,
            ],
          },
        },
        currentViews: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.views', null] },
                ],
              },
              '$metrics.views',
              0,
            ],
          },
        },
        currentReach: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.reach', null] },
                ],
              },
              '$metrics.reach',
              0,
            ],
          },
        },
        currentLikes: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.likes', null] },
                ],
              },
              '$metrics.likes',
              0,
            ],
          },
        },
        currentComments: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.comments', null] },
                ],
              },
              '$metrics.comments',
              0,
            ],
          },
        },
        currentShares: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.shares', null] },
                ],
              },
              '$metrics.shares',
              0,
            ],
          },
        },
        currentSaves: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.saves', null] },
                ],
              },
              '$metrics.saves',
              0,
            ],
          },
        },
        currentEngagement: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.engagement', null] },
                ],
              },
              '$metrics.engagement',
              0,
            ],
          },
        },
        previousViews: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.previousStart] },
                  { $lt: ['$bucketAt', query.previousEnd] },
                  { $ne: ['$metrics.views', null] },
                ],
              },
              '$metrics.views',
              0,
            ],
          },
        },
        previousReach: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.previousStart] },
                  { $lt: ['$bucketAt', query.previousEnd] },
                  { $ne: ['$metrics.reach', null] },
                ],
              },
              '$metrics.reach',
              0,
            ],
          },
        },
        previousEngagement: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.previousStart] },
                  { $lt: ['$bucketAt', query.previousEnd] },
                  { $ne: ['$metrics.engagement', null] },
                ],
              },
              '$metrics.engagement',
              0,
            ],
          },
        },
        hasViews: {
          $max: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.views', null] },
                ],
              },
              1,
              0,
            ],
          },
        },
        hasReach: {
          $max: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.reach', null] },
                ],
              },
              1,
              0,
            ],
          },
        },
        hasEngagement: {
          $max: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.currentStart] },
                  { $lt: ['$bucketAt', query.currentEnd] },
                  { $ne: ['$metrics.engagement', null] },
                ],
              },
              1,
              0,
            ],
          },
        },
        hasPreviousViews: {
          $max: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.previousStart] },
                  { $lt: ['$bucketAt', query.previousEnd] },
                  { $ne: ['$metrics.views', null] },
                ],
              },
              1,
              0,
            ],
          },
        },
        hasPreviousReach: {
          $max: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.previousStart] },
                  { $lt: ['$bucketAt', query.previousEnd] },
                  { $ne: ['$metrics.reach', null] },
                ],
              },
              1,
              0,
            ],
          },
        },
        hasPreviousEngagement: {
          $max: {
            $cond: [
              {
                $and: [
                  { $eq: ['$isDailyAnchor', true] },
                  { $gte: ['$bucketAt', query.previousStart] },
                  { $lt: ['$bucketAt', query.previousEnd] },
                  { $ne: ['$metrics.engagement', null] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    {
      $project: {
        provider: '$_id.provider',
        account: '$_id.account',
        currentFollowerCount: {
          $reduce: {
            input: '$currentFollowerCounts',
            initialValue: null,
            in: {
              $cond: [
                { $and: [{ $ne: ['$$this', null] }, { $ne: ['$$this', undefined] }] },
                '$$this',
                '$$value',
              ],
            },
          },
        },
        currentFollowingCount: {
          $reduce: {
            input: '$currentFollowingCounts',
            initialValue: null,
            in: {
              $cond: [
                { $and: [{ $ne: ['$$this', null] }, { $ne: ['$$this', undefined] }] },
                '$$this',
                '$$value',
              ],
            },
          },
        },
        previousFollowerCount: {
          $reduce: {
            input: '$previousFollowerCounts',
            initialValue: null,
            in: {
              $cond: [
                { $and: [{ $ne: ['$$this', null] }, { $ne: ['$$this', undefined] }] },
                '$$this',
                '$$value',
              ],
            },
          },
        },
        currentPostsDelta: {
          $let: {
            vars: {
              filtered: {
                $filter: {
                  input: '$currentPostsCounts',
                  as: 'v',
                  cond: { $ne: ['$$v', null] },
                },
              },
            },
            in: {
              $cond: [
                { $gt: [{ $size: '$$filtered' }, 0] },
                {
                  $max: [
                    0,
                    {
                      $subtract: [{ $arrayElemAt: ['$$filtered', -1] }, { $arrayElemAt: ['$$filtered', 0] }],
                    },
                  ],
                },
                null,
              ],
            },
          },
        },
        previousPostsDelta: {
          $let: {
            vars: {
              filtered: {
                $filter: {
                  input: '$previousPostsCounts',
                  as: 'v',
                  cond: { $ne: ['$$v', null] },
                },
              },
            },
            in: {
              $cond: [
                { $gt: [{ $size: '$$filtered' }, 0] },
                {
                  $max: [
                    0,
                    {
                      $subtract: [{ $arrayElemAt: ['$$filtered', -1] }, { $arrayElemAt: ['$$filtered', 0] }],
                    },
                  ],
                },
                null,
              ],
            },
          },
        },
        currentViews: 1,
        currentReach: 1,
        currentLikes: 1,
        currentComments: 1,
        currentShares: 1,
        currentSaves: 1,
        currentEngagement: 1,
        previousViews: 1,
        previousReach: 1,
        previousEngagement: 1,
        hasViews: 1,
        hasReach: 1,
        hasEngagement: 1,
        hasPreviousViews: 1,
        hasPreviousReach: 1,
        hasPreviousEngagement: 1,
      },
    },
    {
      $group: {
        _id: '$provider',
        accountCount: { $sum: 1 },
        currentFollowerCounts: { $push: '$currentFollowerCount' },
        currentFollowingCounts: { $push: '$currentFollowingCount' },
        currentPostsDeltas: { $push: '$currentPostsDelta' },
        previousFollowerCounts: { $push: '$previousFollowerCount' },
        previousPostsDeltas: { $push: '$previousPostsDelta' },
        currentViews: { $sum: { $cond: [{ $eq: ['$hasViews', 1] }, '$currentViews', 0] } },
        currentReach: { $sum: { $cond: [{ $eq: ['$hasReach', 1] }, '$currentReach', 0] } },
        currentLikes: { $sum: '$currentLikes' },
        currentComments: { $sum: '$currentComments' },
        currentShares: { $sum: '$currentShares' },
        currentSaves: { $sum: '$currentSaves' },
        currentEngagement: {
          $sum: { $cond: [{ $eq: ['$hasEngagement', 1] }, '$currentEngagement', 0] },
        },
        previousViews: {
          $sum: { $cond: [{ $eq: ['$hasPreviousViews', 1] }, '$previousViews', 0] },
        },
        previousReach: {
          $sum: { $cond: [{ $eq: ['$hasPreviousReach', 1] }, '$previousReach', 0] },
        },
        previousEngagement: {
          $sum: { $cond: [{ $eq: ['$hasPreviousEngagement', 1] }, '$previousEngagement', 0] },
        },
        hasViews: { $max: '$hasViews' },
        hasReach: { $max: '$hasReach' },
        hasEngagement: { $max: '$hasEngagement' },
        hasPreviousViews: { $max: '$hasPreviousViews' },
        hasPreviousReach: { $max: '$hasPreviousReach' },
        hasPreviousEngagement: { $max: '$hasPreviousEngagement' },
      },
    },
  ])

  return rows.map(row => ({
    provider: row._id,
    accountCount: row.accountCount,
    followerCount: sumMetric(row.currentFollowerCounts),
    followingCount: sumMetric(row.currentFollowingCounts),
    postsCount: sumMetric(row.currentPostsDeltas),
    views: row.hasViews ? row.currentViews : null,
    reach: row.hasReach ? row.currentReach : null,
    likes: row.currentLikes || null,
    comments: row.currentComments || null,
    shares: row.currentShares || null,
    saves: row.currentSaves || null,
    engagement: row.hasEngagement ? row.currentEngagement : null,
    previousFollowerCount: sumMetric(row.previousFollowerCounts),
    previousViews: row.hasPreviousViews ? row.previousViews : null,
    previousReach: row.hasPreviousReach ? row.previousReach : null,
    previousEngagement: row.hasPreviousEngagement ? row.previousEngagement : null,
    previousPostsCount: sumMetric(row.previousPostsDeltas),
  }))
}
