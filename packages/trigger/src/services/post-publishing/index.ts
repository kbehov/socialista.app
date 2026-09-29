import { ConnectionStatus, SocialProvider, getAccountByIdWithTokens, type IAccount, type IPost } from '@socialista/db'

import { refreshAccountTokens } from '../token-refresh/index.js'
import { assertPostPublishable } from './capabilities.js'
import { publishFacebookPost } from './facebook.js'
import { PublishHttpError } from './fetch.js'
import { publishInstagramPost } from './instagram.js'
import { publishLinkedInPost } from './linkedin.js'
import { publishThreadsPost } from './threads.js'
import { publishTikTokPost } from './tiktok.js'
import { publishTwitterPost } from './twitter.js'
import {
  PermanentPublishError,
  requireAccessToken,
  type PublishContext,
  type PublishResult,
} from './types.js'

export {
  AmbiguousPublishError,
  PermanentPublishError,
  requireAccessToken,
  type PublishContext,
  type PublishResult,
} from './types.js'
export { PublishHttpError } from './fetch.js'
export { assertPostPublishable } from './capabilities.js'
export { postFirstComment } from './first-comment.js'

async function ensureAccountReady(account: IAccount): Promise<IAccount> {
  if (account.connectionStatus !== ConnectionStatus.CONNECTED) {
    throw new PermanentPublishError(`Account is ${account.connectionStatus}, not connected`)
  }

  const expiresAt = account.accessTokenExpiresAt
  if (!expiresAt || expiresAt.getTime() > Date.now()) {
    return account
  }

  const result = await refreshAccountTokens(account)
  if (result.status !== 'refreshed') {
    throw new PermanentPublishError(
      result.status === 'disconnected' ? result.reason : 'Account access token has expired',
    )
  }

  const refreshed = await getAccountByIdWithTokens(account._id.toString())
  if (!refreshed?.accessToken) {
    throw new PermanentPublishError('Account access token has expired')
  }

  account.accessToken = refreshed.accessToken
  account.refreshToken = refreshed.refreshToken
  account.accessTokenExpiresAt = refreshed.accessTokenExpiresAt
  account.refreshTokenExpiresAt = refreshed.refreshTokenExpiresAt
  return account
}

export async function publishPostToProvider(input: {
  post: IPost
  account: IAccount
  persistOperationId?: (operationId: string) => Promise<void>
}): Promise<PublishResult> {
  assertPostPublishable(input.post)
  const account = await ensureAccountReady(input.account)

  if (input.post.provider !== account.provider) {
    throw new PermanentPublishError('Post provider does not match account provider')
  }

  const ctx: PublishContext = {
    post: input.post,
    account,
    accessToken: requireAccessToken(account),
    persistOperationId: input.persistOperationId,
  }

  switch (account.provider) {
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
    case SocialProvider.TWITTER:
      return publishTwitterPost(ctx)
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
