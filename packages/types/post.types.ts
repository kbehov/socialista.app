import type { MetaResponse } from './common.types.js'
import type { SocialProvider } from './account.types.js'

export type PostType = 'text' | 'image' | 'video' | 'reel' | 'carousel'

export type PostStatus =
  | 'draft'
  | 'scheduled'
  | 'publishing'
  | 'published'
  | 'failed'
  | 'canceled'

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

export type PostTextContent = { body: string }
export type PostImageContent = { media: PostMediaImage }
export type PostVideoContent = { media: PostMediaVideo }
export type PostCarouselContent = { items: PostCarouselItem[] }

/** Kind-specific payload; shape is interpreted via root `type`. */
export type PostContent =
  | PostTextContent
  | PostImageContent
  | PostVideoContent
  | PostCarouselContent

/** Public post shape — never exposes internal ObjectIds. */
export type Post = {
  _id: string
  accountId: string
  workspaceId: string
  createdBy: string
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

export type CreatePostPayload = {
  workspaceId: string
  accountId: string
  provider: SocialProvider
  type: PostType
  content: PostContent
  /** IANA timezone; defaults to account.timezone when omitted. */
  timezone?: string
  status?: PostStatus
  caption?: string
  description?: string
  scheduledAt?: string | Date
  publishedAt?: string | Date
  failureReason?: string
}

export type UpdatePostPayload = {
  type?: PostType
  content?: PostContent
  status?: PostStatus
  timezone?: string
  caption?: string | null
  description?: string | null
  scheduledAt?: string | Date | null
  publishedAt?: string | Date | null
  failureReason?: string | null
}

export type SchedulePostPayload = {
  scheduledAt: Date
  timezone?: string
}

export type GetPostsResponse = {
  posts: Post[]
  meta: MetaResponse
}

export type PostStats = Partial<Record<PostStatus, number>>
