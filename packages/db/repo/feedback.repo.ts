import { FeedbackCategory, FeedbackStatus } from '@socialista/types'
import { FeedbackModel } from '../models/feedback.model.js'
import type {
  CreateFeedbackInput,
  FeedbackDocument,
  IFeedback,
  UpdateFeedbackInput,
} from '../types/feedback.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'
import { toObjectId } from '../utils/isValid.js'

function mapCreateFields(input: CreateFeedbackInput): Partial<IFeedback> {
  return {
    workspaceId: toObjectId(input.workspaceId),
    userId: toObjectId(input.userId),
    message: input.message,
    ...(input.rating !== undefined ? { rating: input.rating } : {}),
    category: input.category ?? FeedbackCategory.GENERAL,
    status: FeedbackStatus.OPEN,
  }
}

function mapUpdateFields(updates: UpdateFeedbackInput): Record<string, unknown> {
  const $set: Record<string, unknown> = {}
  const $unset: Record<string, 1> = {}

  if (updates.message !== undefined) $set.message = updates.message
  if (updates.category !== undefined) $set.category = updates.category
  if (updates.status !== undefined) $set.status = updates.status

  if (updates.rating === null) $unset.rating = 1
  else if (updates.rating !== undefined) $set.rating = updates.rating

  const ops: Record<string, unknown> = {}
  if (Object.keys($set).length > 0) ops.$set = $set
  if (Object.keys($unset).length > 0) ops.$unset = $unset
  return ops
}

export const createFeedback = async (input: CreateFeedbackInput): Promise<FeedbackDocument> => {
  return FeedbackModel.create(mapCreateFields(input))
}

export const getFeedbackById = async (id: string): Promise<IFeedback | null> => {
  return FeedbackModel.findById(id).lean()
}

export const getFeedbacks = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const [feedbacks, total] = await Promise.all([
    FeedbackModel.find(match).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    FeedbackModel.countDocuments(match),
  ])

  return {
    feedbacks,
    meta: buildPaginationMeta(total, pagination, sort),
  }
}

export const updateFeedback = async (
  id: string,
  updates: UpdateFeedbackInput,
): Promise<FeedbackDocument | null> => {
  const ops = mapUpdateFields(updates)
  if (Object.keys(ops).length === 0) {
    return FeedbackModel.findById(id)
  }
  return FeedbackModel.findByIdAndUpdate(id, ops, { new: true })
}

export const deleteFeedback = async (id: string): Promise<boolean> => {
  const deleted = await FeedbackModel.findByIdAndDelete(id)
  return Boolean(deleted)
}
