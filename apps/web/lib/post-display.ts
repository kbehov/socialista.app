import type { Post, PostType } from '@socialista/types'

export function getPostPreviewText(post: Post): string {
  if (post.caption?.trim()) return post.caption.trim()
  if (post.type === 'text' && 'body' in post.content) return post.content.body.trim()
  if (post.description?.trim()) return post.description.trim()
  return 'Untitled post'
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

export function groupPostsByDateKey(posts: Post[]): Map<string, Post[]> {
  const groups = new Map<string, Post[]>()

  for (const post of posts) {
    const key = toDateKey(getPostDisplayDate(post))
    const existing = groups.get(key)
    if (existing) existing.push(post)
    else groups.set(key, [post])
  }

  for (const items of groups.values()) {
    items.sort((a, b) => getPostDisplayDate(a).getTime() - getPostDisplayDate(b).getTime())
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
