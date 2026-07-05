'use server'

import { VIDEO_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CreateVideoPayload,
  DuplicateVideoPayload,
  GetVideosResponse,
  UpdateVideoPayload,
  VideoResponse,
} from '@socialista/types'
import { revalidatePath } from 'next/cache'

const STUDIO_VIDEOS_PATH = '/dashboard/studio/videos'

function revalidateVideoPaths(videoId?: string) {
  revalidatePath(STUDIO_VIDEOS_PATH)
  if (videoId) {
    revalidatePath(`${STUDIO_VIDEOS_PATH}/${videoId}`)
  }
}

export const createVideo = async (
  payload: CreateVideoPayload,
): Promise<ApiResponse<{ video: VideoResponse }>> => {
  const response = await api.post<{ video: VideoResponse }>(VIDEO_ROUTES.CREATE, payload)
  revalidateVideoPaths(response.data?.video.id)
  return response
}

export const getVideo = async (id: string): Promise<ApiResponse<{ video: VideoResponse }>> => {
  return api.get<{ video: VideoResponse }>(VIDEO_ROUTES.GET_BY_ID(id))
}

export const getWorkspaceVideos = async (
  workspaceId: string,
  status?: string,
): Promise<ApiResponse<GetVideosResponse>> => {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  const query = params.toString()
  const path = `${VIDEO_ROUTES.GET_WORKSPACE_VIDEOS(workspaceId)}${query ? `?${query}` : ''}`
  return api.get<GetVideosResponse>(path)
}

export const updateVideo = async (
  id: string,
  payload: UpdateVideoPayload,
): Promise<ApiResponse<{ video: VideoResponse }>> => {
  const response = await api.patch<{ video: VideoResponse }>(VIDEO_ROUTES.UPDATE(id), payload)
  revalidateVideoPaths(id)
  return response
}

export const deleteVideo = async (id: string): Promise<ApiResponse<{ id: string }>> => {
  const response = await api.delete<{ id: string }>(VIDEO_ROUTES.DELETE(id))
  revalidateVideoPaths(id)
  return response
}

export const duplicateVideo = async (
  id: string,
  payload?: DuplicateVideoPayload,
): Promise<ApiResponse<{ video: VideoResponse }>> => {
  const response = await api.post<{ video: VideoResponse }>(VIDEO_ROUTES.DUPLICATE(id), payload ?? {})
  revalidateVideoPaths(response.data?.video.id)
  return response
}
