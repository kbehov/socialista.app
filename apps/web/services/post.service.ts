'use server'

import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { POST_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CreatePostPayload,
  GetPostsResponse,
  Post,
  PostStats,
  SchedulePostPayload,
  UpdatePostPayload,
} from '@socialista/types'
import { revalidatePath } from 'next/cache'

const POSTS_PATH = DASHBOARD_ROUTES.POSTS

function revalidatePostPaths() {
  revalidatePath(POSTS_PATH)
}

export const createPost = async (
  payload: CreatePostPayload,
): Promise<ApiResponse<{ post: Post }>> => {
  const response = await api.post<{ post: Post }>(POST_ROUTES.CREATE, payload)
  revalidatePostPaths()
  return response
}

export const getPost = async (id: string): Promise<ApiResponse<{ post: Post }>> => {
  return api.get<{ post: Post }>(POST_ROUTES.GET_BY_ID(id))
}

export const getWorkspacePosts = async (
  workspaceId: string,
  query?: {
    page?: number
    limit?: number
    sort?: string
    status?: string
    type?: string
  },
): Promise<ApiResponse<GetPostsResponse>> => {
  const params = new URLSearchParams()
  if (query?.page) params.set('page', String(query.page))
  if (query?.limit) params.set('limit', String(query.limit))
  if (query?.sort) params.set('sort', query.sort)
  if (query?.status) params.set('status', query.status)
  if (query?.type) params.set('type', query.type)

  const search = params.toString()
  const path = `${POST_ROUTES.GET_WORKSPACE_POSTS(workspaceId)}${search ? `?${search}` : ''}`
  return api.get<GetPostsResponse>(path)
}

export const getAccountPosts = async (
  accountId: string,
  query?: {
    type?: string
    status?: string
    from?: string
    to?: string
  },
): Promise<ApiResponse<{ posts: Post[] }>> => {
  const params = new URLSearchParams()
  if (query?.type) params.set('type', query.type)
  if (query?.status) params.set('status', query.status)
  if (query?.from) params.set('from', query.from)
  if (query?.to) params.set('to', query.to)

  const search = params.toString()
  const path = `${POST_ROUTES.GET_ACCOUNT_POSTS(accountId)}${search ? `?${search}` : ''}`
  return api.get<{ posts: Post[] }>(path)
}

export const getWorkspacePostStats = async (
  workspaceId: string,
): Promise<ApiResponse<{ stats: PostStats }>> => {
  return api.get<{ stats: PostStats }>(POST_ROUTES.GET_WORKSPACE_POST_STATS(workspaceId))
}

export const updatePost = async (
  id: string,
  payload: UpdatePostPayload,
): Promise<ApiResponse<{ post: Post }>> => {
  const response = await api.patch<{ post: Post }>(POST_ROUTES.UPDATE(id), payload)
  revalidatePostPaths()
  return response
}

export const deletePost = async (id: string): Promise<ApiResponse<{ id: string }>> => {
  const response = await api.delete<{ id: string }>(POST_ROUTES.DELETE(id))
  revalidatePostPaths()
  return response
}

export const schedulePost = async (
  id: string,
  payload: SchedulePostPayload,
): Promise<ApiResponse<{ post: Post }>> => {
  const response = await api.post<{ post: Post }>(POST_ROUTES.SCHEDULE(id), payload)
  revalidatePostPaths()
  return response
}

export const cancelPost = async (id: string): Promise<ApiResponse<{ post: Post }>> => {
  const response = await api.post<{ post: Post }>(POST_ROUTES.CANCEL(id))
  revalidatePostPaths()
  return response
}
