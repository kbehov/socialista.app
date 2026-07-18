'use server'

import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { SLIDESHOW_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CreateSlideshowPayload,
  DuplicateSlideshowPayload,
  GetSlideshowsResponse,
  SlideshowResponse,
  UpdateSlideshowPayload,
} from '@socialista/types'
import { revalidatePath } from 'next/cache'

const STUDIO_SLIDESHOWS_PATH = DASHBOARD_ROUTES.STUDIO.SLIDESHOWS

function revalidateSlideshowPaths(slideshowId?: string) {
  revalidatePath(STUDIO_SLIDESHOWS_PATH)
  if (slideshowId) {
    revalidatePath(DASHBOARD_ROUTES.STUDIO.slideshow(slideshowId))
  }
}

export const createSlideshow = async (
  payload: CreateSlideshowPayload,
): Promise<ApiResponse<{ slideshow: SlideshowResponse }>> => {
  const response = await api.post<{ slideshow: SlideshowResponse }>(SLIDESHOW_ROUTES.CREATE, payload)
  revalidateSlideshowPaths(response.data?.slideshow.id)
  return response
}

export const getSlideshow = async (
  id: string,
  options?: { signal?: AbortSignal },
): Promise<ApiResponse<{ slideshow: SlideshowResponse }>> => {
  return api.get<{ slideshow: SlideshowResponse }>(SLIDESHOW_ROUTES.GET_BY_ID(id), { signal: options?.signal })
}

export const getWorkspaceSlideshows = async (
  workspaceId: string,
  status?: string,
): Promise<ApiResponse<GetSlideshowsResponse>> => {
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  const query = params.toString()
  const path = `${SLIDESHOW_ROUTES.GET_WORKSPACE_SLIDESHOWS(workspaceId)}${query ? `?${query}` : ''}`
  return api.get<GetSlideshowsResponse>(path)
}

export const updateSlideshow = async (
  id: string,
  payload: UpdateSlideshowPayload,
): Promise<ApiResponse<{ slideshow: SlideshowResponse }>> => {
  const response = await api.patch<{ slideshow: SlideshowResponse }>(SLIDESHOW_ROUTES.UPDATE(id), payload)
  revalidateSlideshowPaths(id)
  return response
}

export const deleteSlideshow = async (id: string): Promise<ApiResponse<{ id: string }>> => {
  const response = await api.delete<{ id: string }>(SLIDESHOW_ROUTES.DELETE(id))
  revalidateSlideshowPaths(id)
  return response
}

export const duplicateSlideshow = async (
  id: string,
  payload?: DuplicateSlideshowPayload,
): Promise<ApiResponse<{ slideshow: SlideshowResponse }>> => {
  const response = await api.post<{ slideshow: SlideshowResponse }>(
    SLIDESHOW_ROUTES.DUPLICATE(id),
    payload ?? {},
  )
  revalidateSlideshowPaths(response.data?.slideshow.id)
  return response
}
