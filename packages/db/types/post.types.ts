import type { HydratedDocument, Types } from 'mongoose'
import type { SocialProvider } from './account.types.js'

export enum PostType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  REEL = 'reel',
  /** Multi-item post (Instagram carousel / TikTok photo mode). Slideshows publish as this type. */
  CAROUSEL = 'carousel',
}

export enum PostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  PUBLISHING = 'publishing',
  PUBLISHED = 'published',
  FAILED = 'failed',
  CANCELED = 'canceled',
}

export type PostMediaImage = {
  url: string
  altText?: string
}

export type PostMediaVideo = {
  url: string
  thumbnailUrl?: string
  durationSeconds?: number
}

export type PostCarouselItem =
  | {
      kind: 'image'
      url: string
      altText?: string
    }
  | {
      kind: 'video'
      url: string
      thumbnailUrl?: string
      durationSeconds?: number
    }

export type PostTextContent = {
  body: string
}

export type PostImageContent = {
  media: PostMediaImage
}

export type PostVideoContent = {
  media: PostMediaVideo
}

/** Ordered media items for Instagram carousel / TikTok multi-photo posts. */
export type PostCarouselContent = {
  items: PostCarouselItem[]
}

/** Kind-specific payload; shape is interpreted via root `type`. */
export type PostContent =
  | PostTextContent
  | PostImageContent
  | PostVideoContent
  | PostCarouselContent

export interface IPost {
  _id: Types.ObjectId
  account: Types.ObjectId
  workspace: Types.ObjectId
  createdBy: Types.ObjectId
  provider: SocialProvider
  type: PostType
  status: PostStatus
  content: PostContent
  caption?: string
  description?: string
  scheduledAt?: Date
  timezone: string
  publishedAt?: Date
  failureReason?: string
  createdAt: Date
  updatedAt: Date
}

export type PostDocument = HydratedDocument<IPost>

export type CreatePostInput = {
  account: string
  workspace: string
  createdBy: string
  provider: SocialProvider
  type: PostType
  content: PostContent
  timezone: string
  status?: PostStatus
  caption?: string
  description?: string
  scheduledAt?: Date
  publishedAt?: Date
  failureReason?: string
}

export type UpdatePostInput = {
  type?: PostType
  content?: PostContent
  status?: PostStatus
  caption?: string | null
  description?: string | null
  scheduledAt?: Date | null
  timezone?: string
  publishedAt?: Date | null
  failureReason?: string | null
}

export type GetPostsByAccountFilters = {
  type?: PostType
  status?: PostStatus
  from?: Date
  to?: Date
}

export type UpdatePostStatusExtra = {
  failureReason?: string | null
  publishedAt?: Date | null
}
