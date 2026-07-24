import { PostType, SocialProvider, type IPost } from '@socialista/db'
import { PermanentPublishError } from './types.js'

const FACEBOOK_TYPES = [
  PostType.TEXT,
  PostType.IMAGE,
  PostType.VIDEO,
  PostType.REEL,
  PostType.CAROUSEL,
] as const

const INSTAGRAM_TYPES = [PostType.IMAGE, PostType.VIDEO, PostType.REEL, PostType.CAROUSEL] as const

const TIKTOK_TYPES = [PostType.IMAGE, PostType.VIDEO, PostType.REEL, PostType.CAROUSEL] as const

const THREADS_TYPES = [PostType.TEXT, PostType.IMAGE, PostType.VIDEO, PostType.CAROUSEL] as const

const LINKEDIN_TYPES = [PostType.TEXT, PostType.IMAGE, PostType.VIDEO, PostType.CAROUSEL] as const

export const PROVIDER_PUBLISH_TYPES: Record<string, readonly PostType[]> = {
  [SocialProvider.FACEBOOK]: FACEBOOK_TYPES,
  [SocialProvider.INSTAGRAM]: INSTAGRAM_TYPES,
  [SocialProvider.TIKTOK]: TIKTOK_TYPES,
  [SocialProvider.THREADS]: THREADS_TYPES,
  [SocialProvider.LINKEDIN]: LINKEDIN_TYPES,
}

export function assertPostPublishable(post: IPost): void {
  const supported = PROVIDER_PUBLISH_TYPES[post.provider]
  if (!supported) {
    throw new PermanentPublishError(`Publishing is not supported for ${post.provider}`)
  }
  if (!supported.includes(post.type)) {
    throw new PermanentPublishError(`${post.provider} does not support ${post.type} posts`)
  }

  if (post.provider === SocialProvider.INSTAGRAM && post.type === PostType.TEXT) {
    throw new PermanentPublishError('Instagram does not support text-only posts')
  }

  if (post.provider === SocialProvider.TIKTOK && post.type === PostType.TEXT) {
    throw new PermanentPublishError('TikTok does not support text-only posts')
  }

  if (post.type === PostType.CAROUSEL && post.provider === SocialProvider.LINKEDIN) {
    const items = (post.content as { items?: Array<{ kind?: string }> }).items ?? []
    if (items.some(item => item.kind === 'video')) {
      throw new PermanentPublishError('LinkedIn organic multi-image posts cannot include videos')
    }
  }
}
