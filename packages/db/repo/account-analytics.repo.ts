import { AccountAnalyticsSnapshotModel } from '../models/account-analytics-snapshot.model.js'
import type {
  AccountAnalyticsSeriesPoint,
  AccountPerformanceRankBy,
  AnalyticsGranularity,
  UpsertAnalyticsSnapshotInput,
  WorkspaceAccountBreakdownRow,
  WorkspaceAccountPerformanceLeaders,
  WorkspaceAccountPerformanceRow,
  WorkspaceProviderBreakdownRow,
  WorkspaceProviderSeriesGroup,
} from '../types/account-analytics.types.js'
import type { SocialProvider } from '../types/account.types.js'
import { toObjectId } from '../utils/isValid.js'
import {
  ANALYTICS_UNIT_MAP,
  currentPeriodFlowAccumulators,
  lastNonNullReduce,
  matchAccountBucketRange,
  matchWorkspaceBucketRange,
  partitionPerformanceLeaders,
  periodGaugeAccumulators,
  postsDeltaFromCounts,
  previousPeriodFlowAccumulators,
  pushDailyAnchorMetric,
  pushMetricInRange,
  sortByBucketAtAsc,
  workspaceAccountPerformanceLeadersPipeline,
  workspaceAnalyticsSeriesPipeline,
  workspaceProviderSeriesPipeline,
} from '../pipelines/analytics.pipelines.js'

const DEFAULT_PERFORMANCE_LIMIT = 10
const MAX_PERFORMANCE_LIMIT = 50
const PERFORMANCE_RANK_BY = new Set<AccountPerformanceRankBy>([
  'followerGrowth',
  'followerGrowthPercent',
  'engagement',
  'reach',
])

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

/**
 * Convert lifetime postsCount gauges on a sorted series into posts published
 * since the previous point. One snapshot per day otherwise always yields 0
 * for last−first inside the same bucket.
 */
function withPostsPublishedDeltas(
  points: AccountAnalyticsSeriesPoint[],
): AccountAnalyticsSeriesPoint[] {
  let previousGauge: number | null = null
  return points.map(point => {
    const gauge = point.postsCount
    let published: number | null = null
    if (typeof gauge === 'number' && Number.isFinite(gauge)) {
      if (typeof previousGauge === 'number') {
        published = Math.max(0, gauge - previousGauge)
      }
      previousGauge = gauge
    }
    return { ...point, postsCount: published }
  })
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
 * Gauges (followers/following) use the latest value in the bucket.
 * postsCount is posts published since the previous bucket (lifetime gauge delta).
 * Flows (views/reach/engagement/…) sum only daily-anchor docs to avoid double-counting.
 */
export const getAccountAnalyticsSeries = async (
  query: SeriesQuery,
): Promise<AccountAnalyticsSeriesPoint[]> => {
  const unit = ANALYTICS_UNIT_MAP[query.granularity]

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
    profileViews: Array<number | null>
    linkClicks: Array<number | null>
    engagements: Array<number | null>
    engagementRates: Array<number | null>
  }>([
    matchAccountBucketRange(query.accountId, query.start, query.end),
    sortByBucketAtAsc,
    {
      $group: {
        _id: {
          $dateTrunc: { date: '$bucketAt', unit },
        },
        followerCounts: { $push: '$metrics.followerCount' },
        followingCounts: { $push: '$metrics.followingCount' },
        postsCounts: { $push: '$metrics.postsCount' },
        views: pushDailyAnchorMetric('$metrics.views'),
        reach: pushDailyAnchorMetric('$metrics.reach'),
        likes: pushDailyAnchorMetric('$metrics.likes'),
        comments: pushDailyAnchorMetric('$metrics.comments'),
        shares: pushDailyAnchorMetric('$metrics.shares'),
        saves: pushDailyAnchorMetric('$metrics.saves'),
        profileViews: pushDailyAnchorMetric('$metrics.profileViews'),
        linkClicks: pushDailyAnchorMetric('$metrics.linkClicks'),
        engagements: pushDailyAnchorMetric('$metrics.engagement'),
        engagementRates: pushDailyAnchorMetric('$metrics.engagementRate'),
      },
    },
    { $sort: { _id: 1 } },
  ])

  return withPostsPublishedDeltas(
    rows.map(row => ({
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
      profileViews: sumMetric(row.profileViews),
      linkClicks: sumMetric(row.linkClicks),
      engagement: sumMetric(row.engagements),
      engagementRate: lastMetric(row.engagementRates),
    })),
  )
}

type WorkspaceSeriesQuery = {
  workspaceId: string
  start: Date
  end: Date
  granularity: AnalyticsGranularity
  accountIds?: string[]
}

/** Workspace-level series: sum gauges/flows across accounts per date bucket. */
export const getWorkspaceAnalyticsSeries = async (
  query: WorkspaceSeriesQuery,
): Promise<AccountAnalyticsSeriesPoint[]> => {
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
    profileViews: number
    linkClicks: number
    engagement: number
    hasViews: number
    hasReach: number
    hasProfileViews: number
    hasLinkClicks: number
    hasEngagement: number
  }>(
    workspaceAnalyticsSeriesPipeline({
      workspaceId: query.workspaceId,
      start: query.start,
      end: query.end,
      unit: ANALYTICS_UNIT_MAP[query.granularity],
      accountIds: query.accountIds,
    }),
  )

  return withPostsPublishedDeltas(
    rows.map(row => ({
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
      profileViews: row.hasProfileViews ? row.profileViews : null,
      linkClicks: row.hasLinkClicks ? row.linkClicks : null,
      engagement: row.hasEngagement ? row.engagement : null,
      engagementRate: null,
    })),
  )
}

type BreakdownQuery = {
  workspaceId: string
  currentStart: Date
  currentEnd: Date
  previousStart: Date
  previousEnd: Date
  accountIds?: string[]
}

/** Per-account totals for the current and previous periods (for summary table). */
export const getWorkspaceAccountBreakdown = async (
  query: BreakdownQuery,
): Promise<WorkspaceAccountBreakdownRow[]> => {
  const current = { start: query.currentStart, end: query.currentEnd }
  const previous = { start: query.previousStart, end: query.previousEnd }

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
  }>([
    matchWorkspaceBucketRange(query.workspaceId, query.previousStart, query.currentEnd, query.accountIds),
    sortByBucketAtAsc,
    {
      $group: {
        _id: '$account',
        ...periodGaugeAccumulators(current, previous),
        ...currentPeriodFlowAccumulators(current),
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
        previousFollowerCount ?? (typeof firstFollower === 'number' ? firstFollower : null),
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
  accountIds?: string[]
}

/**
 * Per-provider workspace series in one pass.
 * Stage 1 groups by (date, account, provider); stage 2 rolls up to (date, provider).
 */
export const getWorkspaceProviderSeries = async (
  query: ProviderSeriesQuery,
): Promise<WorkspaceProviderSeriesGroup[]> => {
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
    profileViews: number
    linkClicks: number
    engagement: number
    hasViews: number
    hasReach: number
    hasProfileViews: number
    hasLinkClicks: number
    hasEngagement: number
  }>(
    workspaceProviderSeriesPipeline({
      workspaceId: query.workspaceId,
      start: query.start,
      end: query.end,
      unit: ANALYTICS_UNIT_MAP[query.granularity],
      accountIds: query.accountIds,
    }),
  )

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
      profileViews: row.hasProfileViews ? row.profileViews : null,
      linkClicks: row.hasLinkClicks ? row.linkClicks : null,
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
    points: withPostsPublishedDeltas(points),
  }))
}

type ProviderBreakdownQuery = {
  workspaceId: string
  currentStart: Date
  currentEnd: Date
  previousStart: Date
  previousEnd: Date
  accountIds?: string[]
}

/** Per-provider totals for current and previous periods (side-by-side platform comparison). */
export const getWorkspaceProviderBreakdown = async (
  query: ProviderBreakdownQuery,
): Promise<WorkspaceProviderBreakdownRow[]> => {
  const current = { start: query.currentStart, end: query.currentEnd }
  const previous = { start: query.previousStart, end: query.previousEnd }

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
    matchWorkspaceBucketRange(query.workspaceId, query.previousStart, query.currentEnd, query.accountIds),
    sortByBucketAtAsc,
    {
      $group: {
        _id: {
          provider: '$provider',
          account: '$account',
        },
        ...periodGaugeAccumulators(current, previous),
        previousPostsCounts: pushMetricInRange('$metrics.postsCount', previous),
        ...currentPeriodFlowAccumulators(current),
        ...previousPeriodFlowAccumulators(previous),
      },
    },
    {
      $project: {
        provider: '$_id.provider',
        account: '$_id.account',
        currentFollowerCount: lastNonNullReduce('$currentFollowerCounts'),
        currentFollowingCount: lastNonNullReduce('$currentFollowingCounts'),
        previousFollowerCount: lastNonNullReduce('$previousFollowerCounts'),
        currentPostsDelta: postsDeltaFromCounts('$currentPostsCounts'),
        previousPostsDelta: postsDeltaFromCounts('$previousPostsCounts'),
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

type PerformanceLeadersQuery = {
  workspaceId: string
  currentStart: Date
  currentEnd: Date
  previousStart: Date
  previousEnd: Date
  /** Defaults to followerGrowth (absolute delta). */
  rankBy?: AccountPerformanceRankBy
  /** Defaults to 10; capped at 50. */
  limit?: number
  accountIds?: string[]
}

function clampPerformanceLimit(limit: number | undefined): number {
  if (typeof limit !== 'number' || !Number.isFinite(limit)) return DEFAULT_PERFORMANCE_LIMIT
  return Math.min(MAX_PERFORMANCE_LIMIT, Math.max(1, Math.trunc(limit)))
}

function resolvePerformanceRankBy(rankBy: AccountPerformanceRankBy | undefined): AccountPerformanceRankBy {
  if (rankBy && PERFORMANCE_RANK_BY.has(rankBy)) return rankBy
  return 'followerGrowth'
}

function mapPerformanceRow(row: WorkspaceAccountPerformanceRow): WorkspaceAccountPerformanceRow {
  return {
    accountId: row.accountId,
    provider: row.provider,
    followerCount: row.followerCount,
    previousFollowerCount: row.previousFollowerCount,
    followerGrowth: row.followerGrowth,
    followerGrowthPercent: row.followerGrowthPercent,
    views: row.views,
    reach: row.reach,
    previousReach: row.previousReach,
    reachGrowth: row.reachGrowth,
    engagement: row.engagement,
    previousEngagement: row.previousEngagement,
    engagementGrowth: row.engagementGrowth,
    score: row.score,
  }
}

/**
 * Winning and losing accounts for a workspace in a single aggregation.
 * Ranks by period-over-period delta (followers / engagement / reach).
 * Winners require score > 0; losers require score < 0 — no overlap.
 */
export const getWorkspaceAccountPerformanceLeaders = async (
  query: PerformanceLeadersQuery,
): Promise<WorkspaceAccountPerformanceLeaders> => {
  const rankBy = resolvePerformanceRankBy(query.rankBy)
  const limit = clampPerformanceLimit(query.limit)

  const [result] = await AccountAnalyticsSnapshotModel.aggregate<{
    winners: WorkspaceAccountPerformanceRow[]
    losers: WorkspaceAccountPerformanceRow[]
  }>(
    workspaceAccountPerformanceLeadersPipeline({
      workspaceId: query.workspaceId,
      currentStart: query.currentStart,
      currentEnd: query.currentEnd,
      previousStart: query.previousStart,
      previousEnd: query.previousEnd,
      rankBy,
      limit,
      accountIds: query.accountIds,
    }),
  )

  const partitioned = partitionPerformanceLeaders(
    (result?.winners ?? []).map(mapPerformanceRow),
    (result?.losers ?? []).map(mapPerformanceRow),
    limit,
  )

  return {
    winners: partitioned.winners,
    losers: partitioned.losers,
    rankBy,
    limit,
  }
}
