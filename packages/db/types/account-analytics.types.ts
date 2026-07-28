import type { HydratedDocument, Types } from 'mongoose'
import type { SocialProvider } from './account.types.js'

export enum AnalyticsAccountStatus {
  OK = 'ok',
  NEEDS_REAUTH = 'needs_reauth',
  UNSUPPORTED = 'unsupported',
  ERROR = 'error',
}

export type EngagementRateBasis = 'reach' | 'followers'

export type AnalyticsSnapshotMetrics = {
  followerCount?: number
  followingCount?: number
  postsCount?: number
  views?: number
  reach?: number
  likes?: number
  comments?: number
  shares?: number
  saves?: number
  engagement?: number
  engagementRate?: number
  engagementRateBasis?: EngagementRateBasis
}

export interface IAccountAnalyticsSnapshot {
  _id: Types.ObjectId
  workspace: Types.ObjectId
  account: Types.ObjectId
  provider: SocialProvider
  bucketAt: Date
  capturedAt: Date
  isDailyAnchor: boolean
  windowStart?: Date
  windowEnd?: Date
  metrics: AnalyticsSnapshotMetrics
  missingMetrics: string[]
  raw?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export type AccountAnalyticsSnapshotDocument = HydratedDocument<IAccountAnalyticsSnapshot>

export type UpsertAnalyticsSnapshotInput = {
  workspaceId: string
  accountId: string
  provider: SocialProvider
  bucketAt: Date
  capturedAt: Date
  isDailyAnchor: boolean
  windowStart?: Date
  windowEnd?: Date
  metrics: AnalyticsSnapshotMetrics
  missingMetrics?: string[]
  raw?: Record<string, unknown>
}

export type AnalyticsGranularity = 'day' | 'week' | 'month'

export type AccountAnalyticsSeriesPoint = {
  date: Date
  followerCount: number | null
  followingCount: number | null
  postsCount: number | null
  views: number | null
  reach: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  engagement: number | null
  engagementRate: number | null
}

export type WorkspaceAccountBreakdownRow = {
  accountId: string
  followerCount: number | null
  followingCount: number | null
  postsCount: number | null
  views: number | null
  reach: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  engagement: number | null
  previousFollowerCount: number | null
}

export type WorkspaceProviderSeriesGroup = {
  provider: SocialProvider
  points: AccountAnalyticsSeriesPoint[]
}

export type WorkspaceProviderBreakdownRow = {
  provider: SocialProvider
  accountCount: number
  followerCount: number | null
  followingCount: number | null
  postsCount: number | null
  views: number | null
  reach: number | null
  likes: number | null
  comments: number | null
  shares: number | null
  saves: number | null
  engagement: number | null
  previousFollowerCount: number | null
  previousViews: number | null
  previousReach: number | null
  previousEngagement: number | null
  previousPostsCount: number | null
}

/** Metric used to rank workspace accounts as winners / losers. */
export type AccountPerformanceRankBy =
  | 'followerGrowth'
  | 'followerGrowthPercent'
  | 'engagement'
  | 'reach'

export type WorkspaceAccountPerformanceRow = {
  accountId: string
  provider: SocialProvider
  followerCount: number | null
  previousFollowerCount: number | null
  /** Absolute follower change (current − previous). */
  followerGrowth: number | null
  /** Percent follower change; null when previous is 0 or missing. */
  followerGrowthPercent: number | null
  views: number | null
  reach: number | null
  previousReach: number | null
  /** Reach change vs previous period. */
  reachGrowth: number | null
  engagement: number | null
  previousEngagement: number | null
  /** Engagement change vs previous period. */
  engagementGrowth: number | null
  /** Ranking delta for the selected metric (always period-over-period). */
  score: number
}

export type WorkspaceAccountPerformanceLeaders = {
  winners: WorkspaceAccountPerformanceRow[]
  losers: WorkspaceAccountPerformanceRow[]
  rankBy: AccountPerformanceRankBy
  limit: number
}
