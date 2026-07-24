import type { IAccount, IPost, PostType, SocialProvider } from '@socialista/db'

export type PublishResult = {
  providerPostId: string
  providerPermalink?: string
  providerOperationId?: string
}

export type PublishContext = {
  post: IPost
  account: IAccount
  accessToken: string
  /** Persist intermediate provider operation ids before irreversible publish calls. */
  persistOperationId?: (operationId: string) => Promise<void>
}

export type PostPublisher = (ctx: PublishContext) => Promise<PublishResult>

export class PermanentPublishError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PermanentPublishError'
  }
}

export class AmbiguousPublishError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AmbiguousPublishError'
  }
}

export function requireAccessToken(account: IAccount): string {
  if (!account.accessToken?.trim()) {
    throw new PermanentPublishError('Account is missing an access token')
  }
  return account.accessToken
}

export function getCaption(post: IPost): string {
  return (post.caption ?? post.description ?? '').trim()
}

export function getTextBody(post: IPost): string {
  const content = post.content as { body?: string }
  if (typeof content.body === 'string' && content.body.trim()) return content.body.trim()
  return getCaption(post)
}

export function getMediaUrl(post: IPost): string {
  const content = post.content as { media?: { url?: string } }
  const url = content.media?.url?.trim()
  if (!url) throw new PermanentPublishError('Post media URL is required')
  return url
}

export function getCarouselItems(post: IPost): Array<{
  kind: 'image' | 'video'
  url: string
  altText?: string
  thumbnailUrl?: string
  durationSeconds?: number
}> {
  const content = post.content as { items?: Array<Record<string, unknown>> }
  if (!Array.isArray(content.items) || content.items.length === 0) {
    throw new PermanentPublishError('Carousel must contain at least one item')
  }
  return content.items.map((item, index) => {
    const url = typeof item.url === 'string' ? item.url.trim() : ''
    if (!url) throw new PermanentPublishError(`Carousel item ${index + 1} is missing a URL`)
    const kind = item.kind === 'video' ? 'video' : 'image'
    return {
      kind,
      url,
      altText: typeof item.altText === 'string' ? item.altText : undefined,
      thumbnailUrl: typeof item.thumbnailUrl === 'string' ? item.thumbnailUrl : undefined,
      durationSeconds: typeof item.durationSeconds === 'number' ? item.durationSeconds : undefined,
    }
  })
}

export function assertSupportedType(provider: SocialProvider, type: PostType, supported: readonly PostType[]): void {
  if (!supported.includes(type)) {
    throw new PermanentPublishError(`${provider} does not support ${type} posts`)
  }
}

export function graphVersion(): string {
  return process.env.META_GRAPH_VERSION ?? 'v24.0'
}
