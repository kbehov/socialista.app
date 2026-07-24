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
  PublishPostNowResponse,
  SchedulePostPayload,
  UpdatePostPayload,
} from '@socialista/types'
import { revalidatePath, revalidateTag } from 'next/cache'

const POSTS_PATH = DASHBOARD_ROUTES.POSTS
const POSTS_CACHE_REVALIDATE = 300

function workspacePostsTag(workspaceId: string) {
  return `workspace-posts-${workspaceId}`
}

function workspacePostStatsTag(workspaceId: string) {
  return `workspace-post-stats-${workspaceId}`
}

function revalidateWorkspacePosts(workspaceId?: string) {
  revalidatePath(POSTS_PATH)
  if (!workspaceId) return
  revalidateTag(workspacePostsTag(workspaceId), 'max')
  revalidateTag(workspacePostStatsTag(workspaceId), 'max')
}

export const createPost = async (
  payload: CreatePostPayload,
): Promise<ApiResponse<{ post: Post }>> => {
  const response = await api.post<{ post: Post }>(POST_ROUTES.CREATE, payload)
  revalidateWorkspacePosts(payload.workspaceId)
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
    provider?: string
    account?: string
    from?: string
    to?: string
  },
): Promise<ApiResponse<GetPostsResponse>> => {
  const params = new URLSearchParams()
  if (query?.page) params.set('page', String(query.page))
  if (query?.limit) params.set('limit', String(query.limit))
  if (query?.sort) params.set('sort', query.sort)
  if (query?.status) params.set('status', query.status)
  if (query?.type) params.set('type', query.type)
  if (query?.provider) params.set('provider', query.provider)
  if (query?.account) params.set('account', query.account)
  if (query?.from) params.set('from', query.from)
  if (query?.to) params.set('to', query.to)

  const search = params.toString()
  const path = `${POST_ROUTES.GET_WORKSPACE_POSTS(workspaceId)}${search ? `?${search}` : ''}`
  return api.get<GetPostsResponse>(path, {
    next: {
      revalidate: POSTS_CACHE_REVALIDATE,
      tags: [workspacePostsTag(workspaceId)],
    },
  })
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
  return api.get<{ stats: PostStats }>(POST_ROUTES.GET_WORKSPACE_POST_STATS(workspaceId), {
    next: {
      revalidate: POSTS_CACHE_REVALIDATE,
      tags: [workspacePostStatsTag(workspaceId)],
    },
  })
}

export const updatePost = async (
  id: string,
  payload: UpdatePostPayload,
): Promise<ApiResponse<{ post: Post }>> => {
  const response = await api.patch<{ post: Post }>(POST_ROUTES.UPDATE(id), payload)
  revalidateWorkspacePosts(response.data?.post.workspaceId)
  return response
}

export const deletePost = async (id: string): Promise<ApiResponse<{ id: string; workspaceId: string }>> => {
  const response = await api.delete<{ id: string; workspaceId: string }>(POST_ROUTES.DELETE(id))
  revalidateWorkspacePosts(response.data?.workspaceId)
  return response
}

export const schedulePost = async (
  id: string,
  payload: SchedulePostPayload,
): Promise<ApiResponse<{ post: Post }>> => {
  const response = await api.post<{ post: Post }>(POST_ROUTES.SCHEDULE(id), payload)
  revalidateWorkspacePosts(response.data?.post.workspaceId)
  return response
}

export const publishPostNow = async (
  id: string,
): Promise<ApiResponse<PublishPostNowResponse>> => {
  const response = await api.post<PublishPostNowResponse>(POST_ROUTES.PUBLISH_NOW(id))
  revalidateWorkspacePosts(response.data?.post.workspaceId)
  return response
}

export const cancelPost = async (id: string): Promise<ApiResponse<{ post: Post }>> => {
  const response = await api.post<{ post: Post }>(POST_ROUTES.CANCEL(id))
  revalidateWorkspacePosts(response.data?.post.workspaceId)
  return response
}
