import type { IPost } from '@socialista/db'
import type { PublishPostPayload } from '@socialista/trigger/schemas/publish-post'

export function publishIdempotencyKey(postId: string, scheduleRevision: number): string {
  return `publish-post:${postId}:rev:${scheduleRevision}`
}

export function buildPublishPostTriggerItem(
  post: IPost,
  claimToken: string,
): {
  payload: PublishPostPayload
  options: {
    idempotencyKey: string
    concurrencyKey: string
    queue: 'publish-post'
  }
} {
  const postId = post._id.toString()
  const scheduleRevision = post.scheduleRevision ?? 0
  return {
    payload: {
      postId,
      accountId: post.account.toString(),
      scheduleRevision,
      claimToken,
    },
    options: {
      idempotencyKey: publishIdempotencyKey(postId, scheduleRevision),
      concurrencyKey: post.account.toString(),
      queue: 'publish-post',
    },
  }
}
