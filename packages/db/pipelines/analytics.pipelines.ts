import type { PipelineStage } from 'mongoose'
import type {
  AccountPerformanceRankBy,
  AnalyticsGranularity,
} from '../types/account-analytics.types.js'
import { toObjectId } from '../utils/isValid.js'

export const ANALYTICS_UNIT_MAP: Record<AnalyticsGranularity, 'day' | 'week' | 'month'> = {
  day: 'day',
  week: 'week',
  month: 'month',
}

export type AnalyticsDateUnit = (typeof ANALYTICS_UNIT_MAP)[AnalyticsGranularity]

type PeriodRange = {
  start: Date
  end: Date
}

/** $match snapshots for one account in [start, end). */
export function matchAccountBucketRange(
  accountId: string,
  start: Date,
  end: Date,
): PipelineStage.Match {
  return {
    $match: {
      account: toObjectId(accountId),
      bucketAt: { $gte: start, $lt: end },
    },
  }
}

/** $match snapshots for a workspace in [start, end). */
export function matchWorkspaceBucketRange(
  workspaceId: string,
  start: Date,
  end: Date,
): PipelineStage.Match {
  return {
    $match: {
      workspace: toObjectId(workspaceId),
      bucketAt: { $gte: start, $lt: end },
    },
  }
}

export const sortByBucketAtAsc: PipelineStage.Sort = { $sort: { bucketAt: 1 } }

function inBucketRange(range: PeriodRange) {
  return {
    $and: [{ $gte: ['$bucketAt', range.start] }, { $lt: ['$bucketAt', range.end] }],
  }
}

function dailyAnchorNonNull(metricPath: string) {
  return {
    $and: [{ $eq: ['$isDailyAnchor', true] }, { $ne: [metricPath, null] }],
  }
}

/** Push metric when daily-anchor, else null (single-account series). */
export function pushDailyAnchorMetric(metricPath: string) {
  return {
    $push: {
      $cond: [{ $eq: ['$isDailyAnchor', true] }, metricPath, null],
    },
  }
}

/** Sum flow metric across daily-anchor docs only. */
export function sumDailyAnchorMetric(metricPath: string) {
  return {
    $sum: {
      $cond: [dailyAnchorNonNull(metricPath), metricPath, 0],
    },
  }
}

/** 1 if any daily-anchor doc has the metric, else 0. */
export function hasDailyAnchorMetric(metricPath: string) {
  return {
    $max: {
      $cond: [dailyAnchorNonNull(metricPath), 1, 0],
    },
  }
}

/** Push metric values that fall inside the period; null otherwise. */
export function pushMetricInRange(metricPath: string, range: PeriodRange) {
  return {
    $push: {
      $cond: [inBucketRange(range), metricPath, null],
    },
  }
}

/** Sum daily-anchor flow metric inside a period. */
export function sumDailyAnchorMetricInRange(metricPath: string, range: PeriodRange) {
  return {
    $sum: {
      $cond: [
        {
          $and: [
            { $eq: ['$isDailyAnchor', true] },
            { $gte: ['$bucketAt', range.start] },
            { $lt: ['$bucketAt', range.end] },
            { $ne: [metricPath, null] },
          ],
        },
        metricPath,
        0,
      ],
    },
  }
}

/** Presence flag for a daily-anchor flow metric inside a period. */
export function hasDailyAnchorMetricInRange(metricPath: string, range: PeriodRange) {
  return {
    $max: {
      $cond: [
        {
          $and: [
            { $eq: ['$isDailyAnchor', true] },
            { $gte: ['$bucketAt', range.start] },
            { $lt: ['$bucketAt', range.end] },
            { $ne: [metricPath, null] },
          ],
        },
        1,
        0,
      ],
    },
  }
}

/**
 * Stage-1 accumulators shared by workspace + provider series:
 * latest gauges per account/date bucket, summed daily-anchor flows.
 * postsCount stays a lifetime gauge here; callers convert to per-bucket
 * published counts via adjacent deltas after the series is built.
 */
export function accountDateBucketAccumulators() {
  return {
    followerCount: { $last: '$metrics.followerCount' },
    followingCount: { $last: '$metrics.followingCount' },
    postsCount: { $last: '$metrics.postsCount' },
    views: sumDailyAnchorMetric('$metrics.views'),
    reach: sumDailyAnchorMetric('$metrics.reach'),
    likes: sumDailyAnchorMetric('$metrics.likes'),
    comments: sumDailyAnchorMetric('$metrics.comments'),
    shares: sumDailyAnchorMetric('$metrics.shares'),
    saves: sumDailyAnchorMetric('$metrics.saves'),
    profileViews: sumDailyAnchorMetric('$metrics.profileViews'),
    linkClicks: sumDailyAnchorMetric('$metrics.linkClicks'),
    engagement: sumDailyAnchorMetric('$metrics.engagement'),
    hasViews: hasDailyAnchorMetric('$metrics.views'),
    hasReach: hasDailyAnchorMetric('$metrics.reach'),
    hasProfileViews: hasDailyAnchorMetric('$metrics.profileViews'),
    hasLinkClicks: hasDailyAnchorMetric('$metrics.linkClicks'),
    hasEngagement: hasDailyAnchorMetric('$metrics.engagement'),
  }
}

/** Stage-2 rollup: sum account buckets into a date (or date+provider) group. */
export function seriesRollupAccumulators() {
  return {
    followerCounts: { $push: '$followerCount' },
    followingCounts: { $push: '$followingCount' },
    postsCounts: { $push: '$postsCount' },
    views: { $sum: { $cond: [{ $eq: ['$hasViews', 1] }, '$views', 0] } },
    reach: { $sum: { $cond: [{ $eq: ['$hasReach', 1] }, '$reach', 0] } },
    likes: { $sum: '$likes' },
    comments: { $sum: '$comments' },
    shares: { $sum: '$shares' },
    saves: { $sum: '$saves' },
    profileViews: { $sum: { $cond: [{ $eq: ['$hasProfileViews', 1] }, '$profileViews', 0] } },
    linkClicks: { $sum: { $cond: [{ $eq: ['$hasLinkClicks', 1] }, '$linkClicks', 0] } },
    engagement: { $sum: { $cond: [{ $eq: ['$hasEngagement', 1] }, '$engagement', 0] } },
    hasViews: { $max: '$hasViews' },
    hasReach: { $max: '$hasReach' },
    hasProfileViews: { $max: '$hasProfileViews' },
    hasLinkClicks: { $max: '$hasLinkClicks' },
    hasEngagement: { $max: '$hasEngagement' },
  }
}

/** Gauge pushes for current (+ optional previous) period — shared by breakdown queries. */
export function periodGaugeAccumulators(current: PeriodRange, previous: PeriodRange) {
  return {
    currentFollowerCounts: pushMetricInRange('$metrics.followerCount', current),
    currentFollowingCounts: pushMetricInRange('$metrics.followingCount', current),
    currentPostsCounts: pushMetricInRange('$metrics.postsCount', current),
    previousFollowerCounts: pushMetricInRange('$metrics.followerCount', previous),
  }
}

/** Current-period daily-anchor flow sums + presence flags — shared by breakdown queries. */
export function currentPeriodFlowAccumulators(current: PeriodRange) {
  return {
    currentViews: sumDailyAnchorMetricInRange('$metrics.views', current),
    currentReach: sumDailyAnchorMetricInRange('$metrics.reach', current),
    currentLikes: sumDailyAnchorMetricInRange('$metrics.likes', current),
    currentComments: sumDailyAnchorMetricInRange('$metrics.comments', current),
    currentShares: sumDailyAnchorMetricInRange('$metrics.shares', current),
    currentSaves: sumDailyAnchorMetricInRange('$metrics.saves', current),
    currentEngagement: sumDailyAnchorMetricInRange('$metrics.engagement', current),
    hasViews: hasDailyAnchorMetricInRange('$metrics.views', current),
    hasReach: hasDailyAnchorMetricInRange('$metrics.reach', current),
    hasEngagement: hasDailyAnchorMetricInRange('$metrics.engagement', current),
  }
}

/** Previous-period flow sums + presence (provider breakdown). */
export function previousPeriodFlowAccumulators(previous: PeriodRange) {
  return {
    previousViews: sumDailyAnchorMetricInRange('$metrics.views', previous),
    previousReach: sumDailyAnchorMetricInRange('$metrics.reach', previous),
    previousEngagement: sumDailyAnchorMetricInRange('$metrics.engagement', previous),
    hasPreviousViews: hasDailyAnchorMetricInRange('$metrics.views', previous),
    hasPreviousReach: hasDailyAnchorMetricInRange('$metrics.reach', previous),
    hasPreviousEngagement: hasDailyAnchorMetricInRange('$metrics.engagement', previous),
  }
}

/** Last non-null value from a pushed metric array ($project / $reduce). */
export function lastNonNullReduce(arrayField: string) {
  return {
    $reduce: {
      input: arrayField,
      initialValue: null,
      in: {
        $cond: [
          { $and: [{ $ne: ['$$this', null] }, { $ne: ['$$this', undefined] }] },
          '$$this',
          '$$value',
        ],
      },
    },
  }
}

/** max(0, last − first) of non-null values in a pushed postsCount array. */
export function postsDeltaFromCounts(arrayField: string) {
  return {
    $let: {
      vars: {
        filtered: {
          $filter: {
            input: arrayField,
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
                $subtract: [
                  { $arrayElemAt: ['$$filtered', -1] },
                  { $arrayElemAt: ['$$filtered', 0] },
                ],
              },
            ],
          },
          null,
        ],
      },
    },
  }
}

/**
 * Workspace series: group by (date, account) then roll up to date.
 * Shared structure with provider series (provider kept off the _id).
 */
export function workspaceAnalyticsSeriesPipeline(input: {
  workspaceId: string
  start: Date
  end: Date
  unit: AnalyticsDateUnit
}): PipelineStage[] {
  return [
    matchWorkspaceBucketRange(input.workspaceId, input.start, input.end),
    sortByBucketAtAsc,
    {
      $group: {
        _id: {
          date: { $dateTrunc: { date: '$bucketAt', unit: input.unit } },
          account: '$account',
        },
        ...accountDateBucketAccumulators(),
      },
    },
    {
      $group: {
        _id: '$_id.date',
        ...seriesRollupAccumulators(),
      },
    },
    { $sort: { _id: 1 } },
  ]
}

/**
 * Provider series: group by (date, account, provider) then roll up to (date, provider).
 * Same metric accumulators as workspace series.
 */
export function workspaceProviderSeriesPipeline(input: {
  workspaceId: string
  start: Date
  end: Date
  unit: AnalyticsDateUnit
}): PipelineStage[] {
  return [
    matchWorkspaceBucketRange(input.workspaceId, input.start, input.end),
    sortByBucketAtAsc,
    {
      $group: {
        _id: {
          date: { $dateTrunc: { date: '$bucketAt', unit: input.unit } },
          account: '$account',
          provider: '$provider',
        },
        ...accountDateBucketAccumulators(),
      },
    },
    {
      $group: {
        _id: { date: '$_id.date', provider: '$_id.provider' },
        ...seriesRollupAccumulators(),
      },
    },
    { $sort: { '_id.provider': 1, '_id.date': 1 } },
  ]
}

/**
 * Push only in-range non-null metric values (drops nulls via $$REMOVE).
 * With ascending bucketAt sort, last array element = latest value in the period.
 */
function pushNonNullMetricInRange(metricPath: string, range: PeriodRange) {
  return {
    $push: {
      $cond: [
        {
          $and: [
            { $gte: ['$bucketAt', range.start] },
            { $lt: ['$bucketAt', range.end] },
            { $ne: [metricPath, null] },
          ],
        },
        metricPath,
        '$$REMOVE',
      ],
    },
  }
}

function arrayLast(field: string) {
  return {
    $cond: [
      { $gt: [{ $size: field }, 0] },
      { $arrayElemAt: [field, -1] },
      null,
    ],
  }
}

function arrayFirst(field: string) {
  return {
    $cond: [
      { $gt: [{ $size: field }, 0] },
      { $arrayElemAt: [field, 0] },
      null,
    ],
  }
}

function scoreExpression(rankBy: AccountPerformanceRankBy) {
  switch (rankBy) {
    case 'followerGrowthPercent':
      return '$followerGrowthPercent'
    case 'engagement':
      return '$engagementGrowth'
    case 'reach':
      return '$reachGrowth'
    case 'followerGrowth':
    default:
      return '$followerGrowth'
  }
}

function periodDelta(currentField: string, previousField: string) {
  return {
    $cond: [
      {
        $and: [{ $ne: [currentField, null] }, { $ne: [previousField, null] }],
      },
      { $subtract: [currentField, previousField] },
      null,
    ],
  }
}

/**
 * Winning / losing accounts in one pass ($facet).
 * Score is always a period-over-period delta so lists never mirror each other:
 * winners = score > 0, losers = score < 0, flat (0) excluded from both.
 */
export function workspaceAccountPerformanceLeadersPipeline(input: {
  workspaceId: string
  currentStart: Date
  currentEnd: Date
  previousStart: Date
  previousEnd: Date
  rankBy: AccountPerformanceRankBy
  limit: number
}): PipelineStage[] {
  const current = { start: input.currentStart, end: input.currentEnd }
  const previous = { start: input.previousStart, end: input.previousEnd }
  const score = scoreExpression(input.rankBy)

  return [
    matchWorkspaceBucketRange(input.workspaceId, input.previousStart, input.currentEnd),
    sortByBucketAtAsc,
    {
      $group: {
        _id: '$account',
        provider: { $last: '$provider' },
        currentFollowers: pushNonNullMetricInRange('$metrics.followerCount', current),
        previousFollowers: pushNonNullMetricInRange('$metrics.followerCount', previous),
        views: sumDailyAnchorMetricInRange('$metrics.views', current),
        reach: sumDailyAnchorMetricInRange('$metrics.reach', current),
        previousReach: sumDailyAnchorMetricInRange('$metrics.reach', previous),
        engagement: sumDailyAnchorMetricInRange('$metrics.engagement', current),
        previousEngagement: sumDailyAnchorMetricInRange('$metrics.engagement', previous),
        hasViews: hasDailyAnchorMetricInRange('$metrics.views', current),
        hasReach: hasDailyAnchorMetricInRange('$metrics.reach', current),
        hasPreviousReach: hasDailyAnchorMetricInRange('$metrics.reach', previous),
        hasEngagement: hasDailyAnchorMetricInRange('$metrics.engagement', current),
        hasPreviousEngagement: hasDailyAnchorMetricInRange('$metrics.engagement', previous),
      },
    },
    {
      $project: {
        _id: 0,
        accountId: { $toString: '$_id' },
        provider: 1,
        followerCount: arrayLast('$currentFollowers'),
        // Prefer previous-period last; fall back to first current (intra-period growth).
        previousFollowerCount: {
          $ifNull: [arrayLast('$previousFollowers'), arrayFirst('$currentFollowers')],
        },
        views: {
          $cond: [{ $eq: ['$hasViews', 1] }, '$views', null],
        },
        reach: {
          $cond: [{ $eq: ['$hasReach', 1] }, '$reach', null],
        },
        previousReach: {
          $cond: [{ $eq: ['$hasPreviousReach', 1] }, '$previousReach', null],
        },
        engagement: {
          $cond: [{ $eq: ['$hasEngagement', 1] }, '$engagement', null],
        },
        previousEngagement: {
          $cond: [{ $eq: ['$hasPreviousEngagement', 1] }, '$previousEngagement', null],
        },
      },
    },
    {
      $addFields: {
        followerGrowth: periodDelta('$followerCount', '$previousFollowerCount'),
        followerGrowthPercent: {
          $cond: [
            {
              $and: [
                { $ne: ['$followerCount', null] },
                { $ne: ['$previousFollowerCount', null] },
                { $ne: ['$previousFollowerCount', 0] },
              ],
            },
            {
              $multiply: [
                {
                  $divide: [
                    { $subtract: ['$followerCount', '$previousFollowerCount'] },
                    '$previousFollowerCount',
                  ],
                },
                100,
              ],
            },
            null,
          ],
        },
        engagementGrowth: periodDelta('$engagement', '$previousEngagement'),
        reachGrowth: periodDelta('$reach', '$previousReach'),
      },
    },
    {
      $addFields: {
        score,
      },
    },
    // Drop accounts that cannot be ranked on the chosen metric.
    {
      $match: {
        score: { $type: ['double', 'int', 'long', 'decimal'] },
      },
    },
    {
      $facet: {
        // Strictly positive deltas only — never share an account with losers.
        winners: [
          { $match: { $expr: { $gt: ['$score', 0] } } },
          { $sort: { score: -1, accountId: 1 } },
          { $limit: input.limit },
        ],
        // Strictly negative deltas only — zeros stay out of both lists.
        losers: [
          { $match: { $expr: { $lt: ['$score', 0] } } },
          { $sort: { score: 1, accountId: 1 } },
          { $limit: input.limit },
        ],
      },
    },
  ]
}

/** Winner = strictly positive period delta. */
export function isWinningPerformanceScore(score: number): boolean {
  return Number.isFinite(score) && score > 0
}

/** Loser = strictly negative period delta (zeros are neither). */
export function isLosingPerformanceScore(score: number): boolean {
  return Number.isFinite(score) && score < 0
}

/**
 * Harden aggregation output: keep winners (score > 0) and losers (score < 0)
 * with no shared accountIds.
 */
export function partitionPerformanceLeaders<T extends { accountId: string; score: number }>(
  winners: T[],
  losers: T[],
  limit: number,
): { winners: T[]; losers: T[] } {
  const winning = winners
    .filter(row => isWinningPerformanceScore(row.score))
    .sort((a, b) => b.score - a.score || a.accountId.localeCompare(b.accountId))
    .slice(0, limit)

  const winningIds = new Set(winning.map(row => row.accountId))

  const losing = losers
    .filter(row => isLosingPerformanceScore(row.score) && !winningIds.has(row.accountId))
    .sort((a, b) => a.score - b.score || a.accountId.localeCompare(b.accountId))
    .slice(0, limit)

  return { winners: winning, losers: losing }
}
