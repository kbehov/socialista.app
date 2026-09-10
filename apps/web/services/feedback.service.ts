'use server'

import { FEEDBACK_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CreateFeedbackPayload,
  FeedbackCategory,
  FeedbackResponse,
  FeedbackStatus,
  GetFeedbacksResponse,
  UpdateFeedbackPayload,
} from '@socialista/types'

export const createFeedback = async (
  payload: CreateFeedbackPayload,
): Promise<ApiResponse<FeedbackResponse>> => {
  return api.post<FeedbackResponse>(FEEDBACK_ROUTES.CREATE, payload)
}

export const getFeedback = async (id: string): Promise<ApiResponse<FeedbackResponse>> => {
  return api.get<FeedbackResponse>(FEEDBACK_ROUTES.GET_BY_ID(id))
}

export const getWorkspaceFeedbacks = async (
  workspaceId: string,
  query?: {
    page?: number
    limit?: number
    sort?: string
    userId?: string
    category?: FeedbackCategory
    status?: FeedbackStatus
  },
): Promise<ApiResponse<GetFeedbacksResponse>> => {
  const params = new URLSearchParams()
  if (query?.page) params.set('page', String(query.page))
  if (query?.limit) params.set('limit', String(query.limit))
  if (query?.sort) params.set('sort', query.sort)
  if (query?.userId) params.set('userId', query.userId)
  if (query?.category) params.set('category', query.category)
  if (query?.status) params.set('status', query.status)

  const search = params.toString()
  const path = `${FEEDBACK_ROUTES.GET_WORKSPACE_FEEDBACKS(workspaceId)}${search ? `?${search}` : ''}`
  return api.get<GetFeedbacksResponse>(path)
}

export const updateFeedback = async (
  id: string,
  payload: UpdateFeedbackPayload,
): Promise<ApiResponse<FeedbackResponse>> => {
  return api.patch<FeedbackResponse>(FEEDBACK_ROUTES.UPDATE(id), payload)
}

export const deleteFeedback = async (id: string): Promise<ApiResponse<{ id: string }>> => {
  return api.delete<{ id: string }>(FEEDBACK_ROUTES.DELETE(id))
}
