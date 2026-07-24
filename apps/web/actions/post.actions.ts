'use server'

import { createPost, schedulePost } from '@/services/post.service'
import { uploadToWorkspace } from '@/services/files.service'
import {
  buildCreatePayload,
  resolveScheduleDate,
} from '@/components/posts/composer/composer-utils'
import type {
  ComposerData,
  ComposerSubmitResult,
} from '@/components/posts/composer/composer-types'
import type { AccountSummary, ImageResponse } from '@socialista/types'
import { ApiError } from '@/lib/api'

export async function uploadPostMedia(
  workspaceId: string,
  formData: FormData,
): Promise<{ success: boolean; file?: ImageResponse; message?: string }> {
  try {
    const response = await uploadToWorkspace(workspaceId, formData)
    if (!response.success || !response.data) {
      return {
        success: false,
        message: response.message ?? 'Upload failed',
      }
    }
    return { success: true, file: response.data }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Upload failed',
    }
  }
}

export type PublishOrScheduleInput = {
  accounts: AccountSummary[]
  state: ComposerData
  /** Force draft regardless of schedule mode. */
  asDraft?: boolean
}

export async function publishOrSchedulePosts(
  input: PublishOrScheduleInput,
): Promise<ComposerSubmitResult[]> {
  const { accounts, state, asDraft } = input
  const accountById = new Map(accounts.map(account => [account._id, account]))
  const results: ComposerSubmitResult[] = []

  const scheduledAt =
    !asDraft && state.schedule.mode === 'schedule' ? resolveScheduleDate(state.schedule) : undefined

  const status = asDraft
    ? 'draft'
    : state.schedule.mode === 'schedule'
      ? 'draft'
      : 'draft'

  for (const accountId of state.selectedAccountIds) {
    const account = accountById.get(accountId)
    if (!account) {
      results.push({
        accountId,
        status: 'failed',
        message: 'Account not found',
      })
      continue
    }

    try {
      const payload = buildCreatePayload({
        workspaceId: state.workspaceId,
        account,
        state,
        status,
      })

      const createResponse = await createPost(payload)
      const post = createResponse.data?.post

      if (!createResponse.success || !post) {
        results.push({
          accountId,
          status: 'failed',
          message: createResponse.message ?? 'Failed to create post',
        })
        continue
      }

      if (asDraft) {
        results.push({
          accountId,
          status: 'draft',
          postId: post._id,
        })
        continue
      }

      if (state.schedule.mode === 'schedule') {
        if (!scheduledAt) {
          results.push({
            accountId,
            status: 'failed',
            postId: post._id,
            message: 'Invalid schedule time',
          })
          continue
        }

        const scheduleResponse = await schedulePost(post._id, {
          scheduledAt,
          timezone: state.schedule.timezone,
        })

        if (!scheduleResponse.success) {
          results.push({
            accountId,
            status: 'failed',
            postId: post._id,
            message: scheduleResponse.message ?? 'Failed to schedule post',
          })
          continue
        }

        results.push({
          accountId,
          status: 'scheduled',
          postId: post._id,
        })
        continue
      }

      // "Publish now" — schedule slightly ahead so the minute cron claims it ASAP.
      const nearFuture = new Date(Date.now() + 15_000)
      const scheduleNow = await schedulePost(post._id, {
        scheduledAt: nearFuture,
        timezone: state.schedule.timezone,
      })

      if (!scheduleNow.success) {
        results.push({
          accountId,
          status: 'failed',
          postId: post._id,
          message: scheduleNow.message ?? 'Failed to queue publish',
        })
        continue
      }

      results.push({
        accountId,
        status: 'scheduled',
        postId: post._id,
      })
    } catch (error) {
      results.push({
        accountId,
        status: 'failed',
        message:
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Failed to create post',
      })
    }
  }

  return results
}
