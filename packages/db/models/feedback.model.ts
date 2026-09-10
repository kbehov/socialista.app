import { FEEDBACK_CATEGORY_VALUES, FEEDBACK_STATUS_VALUES, FeedbackCategory, FeedbackStatus } from '@socialista/types'
import { model, Schema } from 'mongoose'
import type { IFeedback } from '../types/feedback.types.js'

const feedbackSchema = new Schema<IFeedback>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    message: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5 },
    category: {
      type: String,
      enum: FEEDBACK_CATEGORY_VALUES,
      required: true,
      default: FeedbackCategory.GENERAL,
    },
    status: {
      type: String,
      enum: FEEDBACK_STATUS_VALUES,
      required: true,
      default: FeedbackStatus.OPEN,
      index: true,
    },
  },
  { timestamps: true },
)

feedbackSchema.index({ workspaceId: 1, createdAt: -1 })
feedbackSchema.index({ workspaceId: 1, userId: 1, createdAt: -1 })

export const FeedbackModel = model<IFeedback>('Feedback', feedbackSchema)
