import type { AppContext } from '@/middlewares/auth.middleware.js'
import {
  assertHasUpdates,
  parseParamId,
  requireTrimmedString,
  withQueryParam,
} from '@/utils/common.utils.js'
import { HttpError, successResponse } from '@/utils/http-response.js'
import { getWorkspaceAsMember } from '@/utils/workspace.utils.js'
import {
  createFeedback as createFeedbackInDb,
  deleteFeedback as deleteFeedbackInDb,
  getFeedbackById,
  getFeedbacks,
  updateFeedback as updateFeedbackInDb,
  type IFeedback,
} from '@socialista/db'
import {
  FEEDBACK_MESSAGE_MAX_LENGTH,
  FEEDBACK_RATING_MAX,
  FEEDBACK_RATING_MIN,
  FeedbackCategory,
  isFeedbackCategory,
  isFeedbackStatus,
  type CreateFeedbackPayload,
  type Feedback,
  type UpdateFeedbackPayload,
} from '@socialista/types'
import type { Context } from 'hono'

function serializeFeedback(feedback: IFeedback): Feedback {
  return {
    _id: feedback._id.toString(),
    workspaceId: feedback.workspaceId.toString(),
    userId: feedback.userId.toString(),
    message: feedback.message,
    ...(feedback.rating !== undefined ? { rating: feedback.rating } : {}),
    category: feedback.category,
    status: feedback.status,
    createdAt: feedback.createdAt,
    updatedAt: feedback.updatedAt,
  }
}

function parseRating(value: unknown, { required }: { required: boolean }): number | undefined {
  if (value === undefined || value === null) {
    if (required) {
      throw new HttpError(400, 'Rating is required')
    }
    return undefined
  }

  const rating = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN
  if (!Number.isInteger(rating) || rating < FEEDBACK_RATING_MIN || rating > FEEDBACK_RATING_MAX) {
    throw new HttpError(
      400,
      `Rating must be an integer between ${FEEDBACK_RATING_MIN} and ${FEEDBACK_RATING_MAX}`,
    )
  }
  return rating
}

function parseMessage(value: unknown): string {
  const message = requireTrimmedString(value, 'Feedback message')
  if (message.length > FEEDBACK_MESSAGE_MAX_LENGTH) {
    throw new HttpError(400, `Feedback message must be ${FEEDBACK_MESSAGE_MAX_LENGTH} characters or less`)
  }
  return message
}

function parseCreateFeedbackInput(body: Record<string, unknown>): CreateFeedbackPayload {
  const workspaceId = parseParamId(
    typeof body.workspaceId === 'string' ? body.workspaceId : undefined,
    'workspace ID',
  )
  const category = body.category === undefined ? undefined : body.category
  if (category !== undefined && !isFeedbackCategory(category)) {
    throw new HttpError(400, 'Invalid feedback category')
  }

  return {
    workspaceId,
    message: parseMessage(body.message),
    rating: parseRating(body.rating, { required: false }),
    ...(category ? { category } : {}),
  }
}

function parseUpdateFeedbackInput(body: Record<string, unknown>): UpdateFeedbackPayload {
  const updates: UpdateFeedbackPayload = {}

  if (body.message !== undefined) {
    updates.message = parseMessage(body.message)
  }

  if (body.rating === null) {
    updates.rating = null
  } else if (body.rating !== undefined) {
    updates.rating = parseRating(body.rating, { required: true })
  }

  if (body.category !== undefined) {
    if (!isFeedbackCategory(body.category)) {
      throw new HttpError(400, 'Invalid feedback category')
    }
    updates.category = body.category
  }

  if (body.status !== undefined) {
    if (!isFeedbackStatus(body.status)) {
      throw new HttpError(400, 'Invalid feedback status')
    }
    updates.status = body.status
  }

  assertHasUpdates(updates)
  return updates
}

async function getFeedbackForMember(id: string, userId: string) {
  const feedback = await getFeedbackById(id)
  if (!feedback) {
    throw new HttpError(404, 'Feedback not found')
  }
  await getWorkspaceAsMember(feedback.workspaceId.toString(), userId)
  return feedback
}

export const createFeedback = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const input = parseCreateFeedbackInput((await c.req.json()) as Record<string, unknown>)
  await getWorkspaceAsMember(input.workspaceId, userId)

  const feedback = await createFeedbackInDb({
    workspaceId: input.workspaceId,
    userId,
    message: input.message,
    rating: input.rating,
    category: input.category ?? FeedbackCategory.GENERAL,
  })

  return successResponse(c, 201, { feedback: serializeFeedback(feedback.toObject()) })
}

export const getWorkspaceFeedbacks = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('workspaceId'), 'workspace ID')
  await getWorkspaceAsMember(workspaceId, userId)

  const data = await getFeedbacks(withQueryParam(c.req.url, 'workspaceId', workspaceId))
  return successResponse(
    c,
    200,
    { feedbacks: data.feedbacks.map(feedback => serializeFeedback(feedback as IFeedback)) },
    data.meta,
  )
}

export const getFeedback = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'feedback ID')
  const feedback = await getFeedbackForMember(id, userId)
  return successResponse(c, 200, { feedback: serializeFeedback(feedback) })
}

export const updateFeedback = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'feedback ID')
  const input = parseUpdateFeedbackInput((await c.req.json()) as Record<string, unknown>)
  await getFeedbackForMember(id, userId)

  const feedback = await updateFeedbackInDb(id, input)
  if (!feedback) {
    throw new HttpError(404, 'Feedback not found')
  }

  return successResponse(c, 200, { feedback: serializeFeedback(feedback.toObject()) })
}

export const deleteFeedback = async (c: Context<AppContext>) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'feedback ID')
  await getFeedbackForMember(id, userId)

  const deleted = await deleteFeedbackInDb(id)
  if (!deleted) {
    throw new HttpError(404, 'Feedback not found')
  }

  return successResponse(c, 200, { id })
}
