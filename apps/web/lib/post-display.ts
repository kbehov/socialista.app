import type { ComposerMediaItem } from '@/types/composer-types'
import {
  ConnectionStatus,
  type AccountSummary,
  type Post,
  type PostStatus,
  type PostType,
} from '@socialista/types'

export function getPostCaption(post: Post): string {
  if (post.caption?.trim()) return post.caption.trim()
  if (post.type === 'text' && 'body' in post.content) return post.content.body.trim()
  return ''
}

export function getPostPreviewText(post: Post): string {
  const caption = getPostCaption(post)
  if (caption) return caption
  if (post.description?.trim()) return post.description.trim()
  return 'Untitled post'
}

export function postToComposerMedia(post: Post): ComposerMediaItem[] {
  if (post.type === 'carousel' && 'items' in post.content) {
    return post.content.items.map(item => {
      if (item.kind === 'video') {
        return {
          kind: 'video' as const,
          url: item.url,
          thumbnailUrl: item.thumbnailUrl,
          durationSeconds: item.durationSeconds,
        }
      }

      return {
        kind: 'image' as const,
        url: item.url,
        altText: item.altText,
      }
    })
  }

  if (post.type === 'image' && 'media' in post.content) {
    const media = post.content.media
    return [
      {
        kind: 'image',
        url: media.url,
        altText: 'altText' in media ? media.altText : undefined,
      },
    ]
  }

  if ((post.type === 'video' || post.type === 'reel') && 'media' in post.content) {
    const media = post.content.media
    return [
      {
        kind: 'video',
        url: media.url,
        thumbnailUrl: 'thumbnailUrl' in media ? media.thumbnailUrl : undefined,
        durationSeconds: 'durationSeconds' in media ? media.durationSeconds : undefined,
      },
    ]
  }

  return []
}

export function createFallbackAccount(post: Post): AccountSummary {
  return {
    _id: post.accountId,
    workspaceId: post.workspaceId,
    provider: post.provider,
    providerAccountId: '',
    accountName: 'Unknown account',
    timezone: post.timezone,
    connectionStatus: ConnectionStatus.CONNECTED,
    createdAt: post.createdAt,
  }
}

export function getPostThumbnail(post: Post): string | null {
  if (post.type === 'image' && 'media' in post.content && 'url' in post.content.media) {
    return post.content.media.url
  }
  if (post.type === 'video' && 'media' in post.content) {
    const media = post.content.media
    return 'thumbnailUrl' in media && media.thumbnailUrl ? media.thumbnailUrl : media.url
  }
  if (post.type === 'carousel' && 'items' in post.content) {
    const first = post.content.items[0]
    if (!first) return null
    if (first.kind === 'image') return first.url
    return first.thumbnailUrl ?? first.url
  }
  return null
}

export function getPostDisplayDate(post: Post): Date {
  if (post.scheduledAt) return new Date(post.scheduledAt)
  if (post.publishedAt) return new Date(post.publishedAt)
  return new Date(post.createdAt)
}

export function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export type PostDateGroupHeading = {
  label: string
  subtitle: string | null
  relativeBadge: 'today' | 'tomorrow' | 'yesterday' | null
}

export function formatPostDateGroupHeading(date: Date, now = new Date()): PostDateGroupHeading {
  const startOfDay = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate())

  const dayOffset = Math.round(
    (startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000,
  )

  let relativeBadge: PostDateGroupHeading['relativeBadge'] = null
  if (dayOffset === 0) relativeBadge = 'today'
  else if (dayOffset === 1) relativeBadge = 'tomorrow'
  else if (dayOffset === -1) relativeBadge = 'yesterday'

  const includeYear = date.getFullYear() !== now.getFullYear()
  const label = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    ...(includeYear ? { year: 'numeric' } : {}),
  })

  const subtitle = relativeBadge
    ? date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return { label, subtitle, relativeBadge }
}

export function getPostStatusCounts(posts: Post[]): Partial<Record<PostStatus, number>> {
  const counts: Partial<Record<PostStatus, number>> = {}

  for (const post of posts) {
    counts[post.status] = (counts[post.status] ?? 0) + 1
  }

  return counts
}

export function getSortedDateKeys(
  groups: Map<string, Post[]>,
  order: 'asc' | 'desc' = 'desc',
): string[] {
  const keys = [...groups.keys()]

  keys.sort((a, b) => (order === 'desc' ? b.localeCompare(a) : a.localeCompare(b)))

  return keys
}

export function groupPostsByDateKey(
  posts: Post[],
  sortOrder: 'asc' | 'desc' = 'asc',
): Map<string, Post[]> {
  const groups = new Map<string, Post[]>()

  for (const post of posts) {
    const key = toDateKey(getPostDisplayDate(post))
    const existing = groups.get(key)
    if (existing) existing.push(post)
    else groups.set(key, [post])
  }

  const direction = sortOrder === 'asc' ? 1 : -1

  for (const items of groups.values()) {
    items.sort(
      (a, b) => direction * (getPostDisplayDate(a).getTime() - getPostDisplayDate(b).getTime()),
    )
  }

  return groups
}

export const POST_TYPE_LABELS: Record<PostType, string> = {
  text: 'Text',
  image: 'Image',
  video: 'Video',
  reel: 'Reel',
  carousel: 'Carousel',
}
