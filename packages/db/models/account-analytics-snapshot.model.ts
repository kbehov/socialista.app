import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import type { IAccountAnalyticsSnapshot } from '../types/account-analytics.types.js'
import { SocialProvider } from '../types/account.types.js'

const metricsSchema = new Schema(
  {
    followerCount: { type: Number },
    followingCount: { type: Number },
    postsCount: { type: Number },
    views: { type: Number },
    reach: { type: Number },
    likes: { type: Number },
    comments: { type: Number },
    shares: { type: Number },
    saves: { type: Number },
    engagement: { type: Number },
    engagementRate: { type: Number },
    engagementRateBasis: { type: String, enum: ['reach', 'followers'] },
  },
  { _id: false },
)

const accountAnalyticsSnapshotSchema = new Schema<IAccountAnalyticsSnapshot>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    account: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    provider: {
      type: String,
      enum: enumValues(SocialProvider),
      required: true,
    },
    bucketAt: { type: Date, required: true },
    capturedAt: { type: Date, required: true },
    isDailyAnchor: { type: Boolean, required: true, default: false },
    windowStart: { type: Date },
    windowEnd: { type: Date },
    metrics: { type: metricsSchema, required: true, default: {} },
    missingMetrics: { type: [String], default: [] },
    raw: { type: Schema.Types.Mixed, select: false },
  },
  { timestamps: true },
)

accountAnalyticsSnapshotSchema.index({ account: 1, bucketAt: -1 }, { unique: true })
accountAnalyticsSnapshotSchema.index({ workspace: 1, bucketAt: -1 })

export const AccountAnalyticsSnapshotModel = model<IAccountAnalyticsSnapshot>(
  'AccountAnalyticsSnapshot',
  accountAnalyticsSnapshotSchema,
)
