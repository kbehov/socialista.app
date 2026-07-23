import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import { SocialProvider } from '../types/account.types.js'
import { PostStatus, PostType, type IPost } from '../types/post.types.js'

const postMediaSchema = new Schema(
  {
    url: { type: String, required: true },
    altText: { type: String },
    thumbnailUrl: { type: String },
    durationSeconds: { type: Number },
  },
  { _id: false },
)

const postCarouselItemSchema = new Schema(
  {
    kind: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true },
    altText: { type: String },
    thumbnailUrl: { type: String },
    durationSeconds: { type: Number },
  },
  { _id: false },
)

const postContentSchema = new Schema(
  {
    body: { type: String },
    media: { type: postMediaSchema },
    items: { type: [postCarouselItemSchema], default: undefined },
  },
  { _id: false },
)

const postSchema = new Schema<IPost>(
  {
    account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, enum: enumValues(SocialProvider), required: true },
    type: { type: String, enum: enumValues(PostType), required: true },
    status: {
      type: String,
      enum: enumValues(PostStatus),
      default: PostStatus.DRAFT,
      required: true,
    },
    content: { type: postContentSchema, required: true },
    caption: { type: String, trim: true },
    description: { type: String, trim: true },
    scheduledAt: { type: Date },
    timezone: { type: String, required: true },
    publishedAt: { type: Date },
    failureReason: { type: String },
  },
  { timestamps: true },
)

// Publish worker — posts due to be sent.
postSchema.index({ status: 1, scheduledAt: 1 })

// Per-account schedule timeline and status-filtered views.
postSchema.index({ account: 1, status: 1, scheduledAt: 1 })

// Workspace calendar / dashboard list, optionally filtered by status.
postSchema.index({ workspace: 1, scheduledAt: 1 })
postSchema.index({ workspace: 1, status: 1, scheduledAt: 1 })

// Recent activity feeds.
postSchema.index({ workspace: 1, createdAt: -1 })
postSchema.index({ createdBy: 1, createdAt: -1 })

// Analytics on published posts — partial index keeps it small.
postSchema.index(
  { publishedAt: 1 },
  { partialFilterExpression: { publishedAt: { $type: 'date' } } },
)

export const PostModel = model<IPost>('Post', postSchema)
