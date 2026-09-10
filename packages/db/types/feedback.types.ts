import type { FeedbackCategory, FeedbackStatus } from '@socialista/types'
import type { HydratedDocument, Types } from 'mongoose'

export type { FeedbackCategory, FeedbackStatus }

export interface IFeedback {
  _id: Types.ObjectId
  workspaceId: Types.ObjectId
  userId: Types.ObjectId
  message: string
  rating?: number
  category: FeedbackCategory
  status: FeedbackStatus
  createdAt: Date
  updatedAt: Date
}

export type FeedbackDocument = HydratedDocument<IFeedback>

export type CreateFeedbackInput = {
  workspaceId: string
  userId: string
  message: string
  rating?: number
  category?: FeedbackCategory
}

export type UpdateFeedbackInput = {
  message?: string
  rating?: number | null
  category?: FeedbackCategory
  status?: FeedbackStatus
}
