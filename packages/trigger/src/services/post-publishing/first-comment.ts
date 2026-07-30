import { SocialProvider, type IAccount, type IPost } from '@socialista/db'
import { z } from 'zod'

import { fetchJson, sleep } from './fetch.js'
import {
  getFirstCommentText,
  graphVersion,
  type PublishResult,
} from './types.js'

const idSchema = z.object({
  id: z.string().min(1),
})

const threadsStatusSchema = z.object({
  status: z.string().optional(),
  error_message: z.string().optional(),
})

function igGraphHost(account: IAccount): string {
  const tokenKind = account.metadata?.tokenKind
  if (tokenKind === 'instagram_user_access_token' || tokenKind === 'instagram_login') {
    return `https://graph.instagram.com/${graphVersion()}`
  }
  return `https://graph.facebook.com/${graphVersion()}`
}

function sanitizeCommentError(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message.slice(0, 500)
  }
  return 'Failed to post first comment'
}

async function postInstagramComment(
  account: IAccount,
  accessToken: string,
  mediaId: string,
  message: string,
): Promise<void> {
  const base = igGraphHost(account)
  await fetchJson(`${base}/${mediaId}/comments`, idSchema, {
    method: 'POST',
    searchParams: {
      message,
      access_token: accessToken,
    },
  })
}

async function postFacebookComment(
  accessToken: string,
  postId: string,
  message: string,
): Promise<void> {
  await fetchJson(`https://graph.facebook.com/${graphVersion()}/${postId}/comments`, idSchema, {
    method: 'POST',
    searchParams: {
      message,
      access_token: accessToken,
    },
  })
}

async function waitForThreadsContainer(containerId: string, accessToken: string): Promise<void> {
  for (let attempt = 0; attempt < 30; attempt++) {
    const status = await fetchJson(
      `https://graph.threads.net/v1.0/${containerId}`,
      threadsStatusSchema,
      {
        searchParams: {
          fields: 'status,error_message',
          access_token: accessToken,
        },
      },
    )
    const code = (status.status ?? '').toUpperCase()
    if (code === 'FINISHED' || code === 'PUBLISHED') return
    if (code === 'ERROR' || code === 'EXPIRED') {
      throw new Error(status.error_message || `Threads reply container failed with status ${code}`)
    }
    await sleep(1500)
  }
  throw new Error('Threads reply container processing timed out')
}

/** Threads first comment = self-reply via reply_to_id. */
async function postThreadsReply(
  account: IAccount,
  accessToken: string,
  parentPostId: string,
  message: string,
): Promise<void> {
  const userId = account.providerAccountId
  const created = await fetchJson(
    `https://graph.threads.net/v1.0/${userId}/threads`,
    idSchema,
    {
      method: 'POST',
      searchParams: {
        media_type: 'TEXT',
        text: message,
        reply_to_id: parentPostId,
        access_token: accessToken,
      },
    },
  )
  await waitForThreadsContainer(created.id, accessToken)
  await fetchJson(`https://graph.threads.net/v1.0/${userId}/threads_publish`, idSchema, {
    method: 'POST',
    searchParams: {
      creation_id: created.id,
      access_token: accessToken,
    },
  })
}

/**
 * Post the configured first comment after a successful publish.
 * Never throws — returns a sanitized error string on failure so the post can stay published.
 */
export async function postFirstComment(input: {
  post: IPost
  account: IAccount
  accessToken: string
  result: PublishResult
}): Promise<string | undefined> {
  const message = getFirstCommentText(input.post)
  if (!message) return undefined
  if (!input.result.providerPostId) {
    return 'Missing provider post id for first comment'
  }

  try {
    switch (input.account.provider) {
      case SocialProvider.INSTAGRAM:
        await postInstagramComment(
          input.account,
          input.accessToken,
          input.result.providerPostId,
          message,
        )
        return undefined
      case SocialProvider.FACEBOOK:
        await postFacebookComment(input.accessToken, input.result.providerPostId, message)
        return undefined
      case SocialProvider.THREADS:
        await postThreadsReply(
          input.account,
          input.accessToken,
          input.result.providerPostId,
          message,
        )
        return undefined
      default:
        return `${input.account.provider} does not support first comments`
    }
  } catch (error) {
    return sanitizeCommentError(error)
  }
}
