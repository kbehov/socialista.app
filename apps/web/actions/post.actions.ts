'use server'

import { ApiError } from '@/lib/api'
import { uploadToWorkspace } from '@/services/files.service'
import { createPost, publishPostNow, schedulePost, updatePost } from '@/services/post.service'
import type { ComposerData, ComposerSubmitResult } from '@/types/composer-types'
import {
  buildCreatePayload,
  buildUpdatePayload,
  isPostEditable,
  resolveScheduleDate,
  validateComposer,
} from '@/utils/composer.utils'
import type { AccountSummary, ImageResponse, Post } from '@socialista/types'

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
      message: error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

export type PublishOrScheduleInput = {
  accounts: AccountSummary[]
  state: ComposerData
  /** Force draft regardless of schedule mode. */
  asDraft?: boolean
}

export async function publishOrSchedulePosts(input: PublishOrScheduleInput): Promise<ComposerSubmitResult[]> {
  const { accounts, state, asDraft } = input
  const accountById = new Map(accounts.map(account => [account._id, account]))
  const results: ComposerSubmitResult[] = []

  const scheduledAt = !asDraft && state.schedule.mode === 'schedule' ? resolveScheduleDate(state.schedule) : undefined

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
        status: 'draft',
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

      // Publish now — claim + enqueue Trigger task immediately (one call per account/post).
      const publishResponse = await publishPostNow(post._id)

      if (!publishResponse.success || !publishResponse.data?.post) {
        results.push({
          accountId,
          status: 'failed',
          postId: post._id,
          message: publishResponse.message ?? 'Failed to queue publish',
        })
        continue
      }

      results.push({
        accountId,
        status: 'publishing',
        postId: post._id,
      })
    } catch (error) {
      results.push({
        accountId,
        status: 'failed',
        message:
          error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Failed to create post',
      })
    }
  }

  return results
}

export async function publishExistingPost(postId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await publishPostNow(postId)

    if (!response.success) {
      return { success: false, message: response.message ?? 'Failed to publish post' }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Failed to publish post',
    }
  }
}

export type UpdateExistingPostIntent = 'draft' | 'schedule' | 'publish'

export type UpdateExistingPostInput = {
  post: Post
  account: AccountSummary
  state: ComposerData
  intent: UpdateExistingPostIntent
}

export async function updateExistingPost(
  input: UpdateExistingPostInput,
): Promise<{ success: boolean; message?: string }> {
  const { post, account, state, intent } = input

  if (!isPostEditable(post.status)) {
    return { success: false, message: 'Only draft and scheduled posts can be edited' }
  }

  if (account._id !== post.accountId) {
    return { success: false, message: 'Account does not match this post' }
  }

  const issues = validateComposer(state, [account])
  if (issues.length > 0 && intent !== 'draft') {
    return { success: false, message: issues[0]?.message ?? 'Fix validation errors' }
  }

  if (intent === 'draft' && state.selectedAccountIds.length === 0) {
    return { success: false, message: 'Post account is missing' }
  }

  try {
    const payload = buildUpdatePayload({ account, state })

    if (intent === 'draft') {
      const response = await updatePost(post._id, {
        ...payload,
        status: 'draft',
        scheduledAt: null,
      })

      if (!response.success) {
        return { success: false, message: response.message ?? 'Failed to save draft' }
      }

      return { success: true }
    }

    const updateResponse = await updatePost(post._id, payload)
    if (!updateResponse.success) {
      return { success: false, message: updateResponse.message ?? 'Failed to update post' }
    }

    if (intent === 'schedule') {
      const scheduledAt = resolveScheduleDate(state.schedule)
      if (!scheduledAt) {
        return { success: false, message: 'Invalid schedule time' }
      }

      const scheduleResponse = await schedulePost(post._id, {
        scheduledAt,
        timezone: state.schedule.timezone,
      })

      if (!scheduleResponse.success) {
        return { success: false, message: scheduleResponse.message ?? 'Failed to schedule post' }
      }

      return { success: true }
    }

    const publishResponse = await publishPostNow(post._id)
    if (!publishResponse.success) {
      return { success: false, message: publishResponse.message ?? 'Failed to publish post' }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof ApiError ? error.message : error instanceof Error ? error.message : 'Failed to update post',
    }
  }
}
