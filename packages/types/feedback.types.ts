export const FeedbackCategory = {
  BUG: 'bug',
  FEATURE: 'feature',
  GENERAL: 'general',
} as const

export type FeedbackCategory = (typeof FeedbackCategory)[keyof typeof FeedbackCategory]

export const FEEDBACK_CATEGORY_VALUES = Object.values(FeedbackCategory)

const FEEDBACK_CATEGORY_SET = new Set<string>(FEEDBACK_CATEGORY_VALUES)

export function isFeedbackCategory(value: unknown): value is FeedbackCategory {
  return typeof value === 'string' && FEEDBACK_CATEGORY_SET.has(value)
}

export const FeedbackStatus = {
  OPEN: 'open',
  REVIEWED: 'reviewed',
  CLOSED: 'closed',
} as const

export type FeedbackStatus = (typeof FeedbackStatus)[keyof typeof FeedbackStatus]

export const FEEDBACK_STATUS_VALUES = Object.values(FeedbackStatus)

const FEEDBACK_STATUS_SET = new Set<string>(FEEDBACK_STATUS_VALUES)

export function isFeedbackStatus(value: unknown): value is FeedbackStatus {
  return typeof value === 'string' && FEEDBACK_STATUS_SET.has(value)
}

export const FEEDBACK_MESSAGE_MAX_LENGTH = 2000
export const FEEDBACK_RATING_MIN = 1
export const FEEDBACK_RATING_MAX = 5

export type Feedback = {
  _id: string
  workspaceId: string
  userId: string
  message: string
  rating?: number
  category: FeedbackCategory
  status: FeedbackStatus
  createdAt: Date
  updatedAt: Date
}

export type CreateFeedbackPayload = {
  workspaceId: string
  message: string
  rating?: number
  category?: FeedbackCategory
}

export type UpdateFeedbackPayload = {
  message?: string
  rating?: number | null
  category?: FeedbackCategory
  status?: FeedbackStatus
}

export type FeedbackResponse = {
  feedback: Feedback
}

export type GetFeedbacksResponse = {
  feedbacks: Feedback[]
}
