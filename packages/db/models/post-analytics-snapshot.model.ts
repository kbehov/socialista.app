import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import { SocialProvider } from '../types/account.types.js'
import {
  PostAnalyticsCheckpoint,
  type IPostAnalyticsSnapshot,
} from '../types/post-analytics.types.js'

const metricsSchema = new Schema(
  {
    views: { type: Number },
    reach: { type: Number },
    likes: { type: Number },
    comments: { type: Number },
    shares: { type: Number },
    saves: { type: Number },
    engagement: { type: Number },
  },
  { _id: false },
)

const postAnalyticsSnapshotSchema = new Schema<IPostAnalyticsSnapshot>(
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
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    provider: {
      type: String,
      enum: enumValues(SocialProvider),
      required: true,
    },
    providerPostId: { type: String, required: true },
    checkpointKey: {
      type: String,
      enum: enumValues(PostAnalyticsCheckpoint),
      required: true,
    },
    hoursSincePublish: { type: Number, required: true },
    publishedAt: { type: Date, required: true },
    capturedAt: { type: Date, required: true },
    metrics: { type: metricsSchema, required: true, default: {} },
    missingMetrics: { type: [String], default: [] },
    raw: { type: Schema.Types.Mixed, select: false },
  },
  { timestamps: true },
)

postAnalyticsSnapshotSchema.index({ post: 1, checkpointKey: 1 }, { unique: true })
postAnalyticsSnapshotSchema.index({ workspace: 1, capturedAt: -1 })
postAnalyticsSnapshotSchema.index({ account: 1, capturedAt: -1 })

export const PostAnalyticsSnapshotModel = model<IPostAnalyticsSnapshot>(
  'PostAnalyticsSnapshot',
  postAnalyticsSnapshotSchema,
)
