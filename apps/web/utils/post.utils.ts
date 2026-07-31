import { getSocialPlatformLabel } from '@/components/icons/social-platform-icon'
import { getPostPreviewText } from '@/lib/posts/post-display'
import { isPostEditable } from '@/utils/composer.utils'
import type { Post, PostStatus } from '@socialista/types'

/** Draft and scheduled posts can be published immediately. */
export function canPostNow(status: PostStatus): boolean {
  return isPostEditable(status)
}

export function canDeletePost(status: PostStatus): boolean {
  return status !== 'publishing'
}

export function getAccountDisplayName(account: { accountName?: string | null; username?: string | null }): string {
  return account.accountName || account.username || 'Account'
}

export function pluralizePosts(count: number): string {
  return count === 1 ? '1 post' : `${count} posts`
}

export function truncateText(text: string, max = 72): string {
  const trimmed = text.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max - 1).trimEnd()}…`
}

export function indexById<T extends { _id: string }>(items: T[]): Record<string, T> {
  return Object.fromEntries(items.map(item => [item._id, item]))
}

export function getPostDeleteDescription(post: Post): string {
  const preview = truncateText(getPostPreviewText(post))
  const platform = getSocialPlatformLabel(post.provider)

  switch (post.status) {
    case 'scheduled':
      return `“${preview}” will be removed and won’t publish to ${platform}. This can’t be undone.`
    case 'published':
      return `“${preview}” will be removed from Socialista. This won’t delete it from ${platform}.`
    case 'draft':
      return `“${preview}” will be permanently deleted. This can’t be undone.`
    default:
      return `“${preview}” will be permanently deleted. This can’t be undone.`
  }
}
