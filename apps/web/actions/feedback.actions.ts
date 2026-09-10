'use server'

import { auth } from '@/auth'
import { ApiError } from '@/lib/api'
import { createFeedback } from '@/services/feedback.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { FEEDBACK_MESSAGE_MAX_LENGTH } from '@socialista/types'

export type SubmitFeedbackResult = { success: true } | { success: false; error: string }

export async function submitFeedbackAction(message: string): Promise<SubmitFeedbackResult> {
  const trimmed = message.trim()
  if (!trimmed) {
    return { success: false, error: 'Write a short note first' }
  }
  if (trimmed.length > FEEDBACK_MESSAGE_MAX_LENGTH) {
    return { success: false, error: `Keep feedback to ${FEEDBACK_MESSAGE_MAX_LENGTH} characters or less` }
  }

  const [session, workspace] = await Promise.all([auth(), getCurrentWorkspace()])
  if (!session?.user?.id) {
    return { success: false, error: 'You must be signed in to send feedback' }
  }
  if (!workspace) {
    return { success: false, error: 'Select a workspace to send feedback' }
  }

  try {
    const response = await createFeedback({
      workspaceId: workspace.id || workspace._id,
      message: trimmed,
    })
    if (!response.success) {
      return { success: false, error: response.message ?? 'Could not send feedback' }
    }
    return { success: true }
  } catch (error) {
    if (error instanceof ApiError) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Could not send feedback' }
  }
}
