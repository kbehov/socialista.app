'use server'

import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { UGC_PROJECT_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CreateUgcProjectPayload,
  GenerateUgcScriptPayload,
  GenerateUgcStillsPayload,
  GenerateUgcVideosPayload,
  GetUgcProjectsResponse,
  OpenUgcEditorResponse,
  UgcGenerationHandle,
  UgcProject,
  UpdateUgcProjectPayload,
} from '@socialista/types'
import { revalidatePath } from 'next/cache'

const STUDIO_UGC_PATH = DASHBOARD_ROUTES.STUDIO.UGC

function revalidateUgcPaths(projectId?: string) {
  revalidatePath(STUDIO_UGC_PATH)
  if (projectId) {
    revalidatePath(DASHBOARD_ROUTES.STUDIO.ugcProject(projectId))
  }
}

export const createUgcProject = async (
  payload: CreateUgcProjectPayload,
): Promise<ApiResponse<{ project: UgcProject }>> => {
  const response = await api.post<{ project: UgcProject }>(UGC_PROJECT_ROUTES.CREATE, payload)
  revalidateUgcPaths(response.data?.project.id)
  return response
}

export const getUgcProject = async (
  id: string,
  options?: { signal?: AbortSignal },
): Promise<ApiResponse<{ project: UgcProject }>> => {
  return api.get<{ project: UgcProject }>(UGC_PROJECT_ROUTES.GET_BY_ID(id), { signal: options?.signal })
}

export const getWorkspaceUgcProjects = async (
  workspaceId: string,
): Promise<ApiResponse<GetUgcProjectsResponse>> => {
  return api.get<GetUgcProjectsResponse>(UGC_PROJECT_ROUTES.GET_WORKSPACE_PROJECTS(workspaceId))
}

export const updateUgcProject = async (
  id: string,
  payload: UpdateUgcProjectPayload,
): Promise<ApiResponse<{ project: UgcProject }>> => {
  const response = await api.patch<{ project: UgcProject }>(UGC_PROJECT_ROUTES.UPDATE(id), payload)
  revalidateUgcPaths(id)
  return response
}

export const deleteUgcProject = async (id: string): Promise<ApiResponse<{ id: string }>> => {
  const response = await api.delete<{ id: string }>(UGC_PROJECT_ROUTES.DELETE(id))
  revalidateUgcPaths(id)
  return response
}

export const generateUgcStills = async (
  id: string,
  payload?: GenerateUgcStillsPayload,
): Promise<ApiResponse<UgcGenerationHandle>> => {
  const response = await api.post<UgcGenerationHandle>(UGC_PROJECT_ROUTES.GENERATE_STILLS(id), payload ?? {})
  revalidateUgcPaths(id)
  return response
}

export const generateUgcScript = async (
  id: string,
  payload?: GenerateUgcScriptPayload,
): Promise<ApiResponse<{ project: UgcProject }>> => {
  const response = await api.post<{ project: UgcProject }>(UGC_PROJECT_ROUTES.GENERATE_SCRIPT(id), payload ?? {})
  revalidateUgcPaths(id)
  return response
}

export const generateUgcVideos = async (
  id: string,
  payload?: GenerateUgcVideosPayload,
): Promise<ApiResponse<UgcGenerationHandle>> => {
  const response = await api.post<UgcGenerationHandle>(UGC_PROJECT_ROUTES.GENERATE_VIDEOS(id), payload ?? {})
  revalidateUgcPaths(id)
  return response
}

export const regenerateUgcStill = async (
  id: string,
  variantId: string,
  index: number,
): Promise<ApiResponse<UgcGenerationHandle>> => {
  const response = await api.post<UgcGenerationHandle>(
    UGC_PROJECT_ROUTES.REGENERATE_STILL(id, variantId, index),
    {},
  )
  revalidateUgcPaths(id)
  return response
}

export const regenerateUgcVideo = async (
  id: string,
  variantId: string,
  payload?: GenerateUgcVideosPayload,
): Promise<ApiResponse<UgcGenerationHandle>> => {
  const response = await api.post<UgcGenerationHandle>(
    UGC_PROJECT_ROUTES.REGENERATE_VIDEO(id, variantId),
    payload ?? {},
  )
  revalidateUgcPaths(id)
  return response
}

export const openUgcVariantEditor = async (
  id: string,
  variantId: string,
): Promise<ApiResponse<OpenUgcEditorResponse>> => {
  const response = await api.post<OpenUgcEditorResponse>(UGC_PROJECT_ROUTES.OPEN_EDITOR(id, variantId), {})
  revalidateUgcPaths(id)
  return response
}
