import type { HydratedDocument, Types } from 'mongoose'
import type { SocialProvider } from './account.types.js'

/** Nominal checkpoints after `publishedAt`. At most one successful snapshot per key. */
export enum PostAnalyticsCheckpoint {
  H1 = '1h',
  H6 = '6h',
  H24 = '24h',
  H48 = '48h',
  H72 = '72h',
  D7 = '7d',
  D30 = '30d',
}

/** Schedule / lease state stored on the Post document. */
export type PostAnalyticsState = {
  nextCheckpointKey?: PostAnalyticsCheckpoint
  nextCheckpointAt?: Date
  inFlightCheckpointKey?: PostAnalyticsCheckpoint
  leasedUntil?: Date
  consecutiveFailures: number
  lastError?: string
  completedAt?: Date
}

export type PostAnalyticsMetrics = {
  views?: number
  reach?: number
  likes?: number
  comments?: number
  shares?: number
  saves?: number
  engagement?: number
}

export interface IPostAnalyticsSnapshot {
  _id: Types.ObjectId
  workspace: Types.ObjectId
  account: Types.ObjectId
  post: Types.ObjectId
  provider: SocialProvider
  providerPostId: string
  checkpointKey: PostAnalyticsCheckpoint
  hoursSincePublish: number
  publishedAt: Date
  capturedAt: Date
  metrics: PostAnalyticsMetrics
  missingMetrics: string[]
  raw?: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

export type PostAnalyticsSnapshotDocument = HydratedDocument<IPostAnalyticsSnapshot>

export type InsertPostAnalyticsSnapshotInput = {
  workspaceId: string
  accountId: string
  postId: string
  provider: SocialProvider
  providerPostId: string
  checkpointKey: PostAnalyticsCheckpoint
  hoursSincePublish: number
  publishedAt: Date
  capturedAt: Date
  metrics: PostAnalyticsMetrics
  missingMetrics?: string[]
  raw?: Record<string, unknown>
}
