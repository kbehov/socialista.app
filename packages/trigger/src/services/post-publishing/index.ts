import { ConnectionStatus, SocialProvider, type IAccount, type IPost } from '@socialista/db'

import { assertPostPublishable } from './capabilities.js'
import { publishFacebookPost } from './facebook.js'
import { PublishHttpError } from './fetch.js'
import { publishInstagramPost } from './instagram.js'
import { publishLinkedInPost } from './linkedin.js'
import { publishThreadsPost } from './threads.js'
import { publishTikTokPost } from './tiktok.js'
import {
  PermanentPublishError,
  requireAccessToken,
  type PublishContext,
  type PublishResult,
} from './types.js'

export {
  AmbiguousPublishError,
  PermanentPublishError,
  type PublishContext,
  type PublishResult,
} from './types.js'
export { PublishHttpError } from './fetch.js'
export { assertPostPublishable } from './capabilities.js'

function assertAccountReady(account: IAccount): void {
  if (account.connectionStatus !== ConnectionStatus.CONNECTED) {
    throw new PermanentPublishError(`Account is ${account.connectionStatus}, not connected`)
  }
  if (account.accessTokenExpiresAt && account.accessTokenExpiresAt.getTime() <= Date.now()) {
    throw new PermanentPublishError('Account access token has expired')
  }
}

export async function publishPostToProvider(input: {
  post: IPost
  account: IAccount
  persistOperationId?: (operationId: string) => Promise<void>
}): Promise<PublishResult> {
  assertPostPublishable(input.post)
  assertAccountReady(input.account)

  if (input.post.provider !== input.account.provider) {
    throw new PermanentPublishError('Post provider does not match account provider')
  }

  const ctx: PublishContext = {
    post: input.post,
    account: input.account,
    accessToken: requireAccessToken(input.account),
    persistOperationId: input.persistOperationId,
  }

  switch (input.account.provider) {
    case SocialProvider.FACEBOOK:
      return publishFacebookPost(ctx)
    case SocialProvider.INSTAGRAM:
      return publishInstagramPost(ctx)
    case SocialProvider.TIKTOK:
      return publishTikTokPost(ctx)
    case SocialProvider.THREADS:
      return publishThreadsPost(ctx)
    case SocialProvider.LINKEDIN:
      return publishLinkedInPost(ctx)
    default:
      throw new PermanentPublishError(`Unsupported provider: ${input.account.provider}`)
  }
}

export function isRetryablePublishError(error: unknown): boolean {
  if (error instanceof PermanentPublishError) return false
  if (error instanceof PublishHttpError) return error.retryable
  if (error instanceof TypeError) return true
  if (error instanceof Error && /network|timeout|ECONNRESET|ETIMEDOUT|fetch failed/i.test(error.message)) {
    return true
  }
  return false
}

export function sanitizeFailureReason(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.slice(0, 500)
  }
  return 'Publish failed'
}
