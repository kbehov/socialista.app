'use server'

import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { UGC_PROJECT_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CreateUgcClipPayload,
  CreateUgcProjectPayload,
  GenerateUgcImageAdPayload,
  GenerateUgcScriptPayload,
  GenerateUgcStillsPayload,
  GenerateUgcVideosPayload,
  GetUgcProjectsResponse,
  OpenUgcEditorResponse,
  UgcGenerationHandle,
  UgcProject,
  UpdateUgcClipPayload,
  UpdateUgcProjectPayload,
} from '@socialista/types'
import { revalidatePath } from 'next/cache'

const STUDIO_UGC_PATH = DASHBOARD_ROUTES.STUDIO.UGC

function revalidateUgcList() {
  revalidatePath(STUDIO_UGC_PATH)
}

export const createUgcProject = async (
  payload: CreateUgcProjectPayload,
): Promise<ApiResponse<{ project: UgcProject }>> => {
  const response = await api.post<{ project: UgcProject }>(UGC_PROJECT_ROUTES.CREATE, payload)
  revalidateUgcList()
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
  query?: { projectId?: string },
): Promise<ApiResponse<GetUgcProjectsResponse>> => {
  const params = new URLSearchParams()
  if (query?.projectId) params.set('project', query.projectId)
  const search = params.toString()
  const path = `${UGC_PROJECT_ROUTES.GET_WORKSPACE_PROJECTS(workspaceId)}${search ? `?${search}` : ''}`
  return api.get<GetUgcProjectsResponse>(path)
}

export const updateUgcProject = async (
  id: string,
  payload: UpdateUgcProjectPayload,
): Promise<ApiResponse<{ project: UgcProject }>> => {
  return api.patch<{ project: UgcProject }>(UGC_PROJECT_ROUTES.UPDATE(id), payload)
}

export const deleteUgcProject = async (id: string): Promise<ApiResponse<{ id: string }>> => {
  const response = await api.delete<{ id: string }>(UGC_PROJECT_ROUTES.DELETE(id))
  revalidateUgcList()
  return response
}

export const createUgcClip = async (
  id: string,
  payload: CreateUgcClipPayload,
): Promise<ApiResponse<{ project: UgcProject }>> => {
  return api.post<{ project: UgcProject }>(UGC_PROJECT_ROUTES.CREATE_CLIP(id), payload)
}

export const updateUgcClip = async (
  id: string,
  clipId: string,
  payload: UpdateUgcClipPayload,
): Promise<ApiResponse<{ project: UgcProject }>> => {
  return api.patch<{ project: UgcProject }>(UGC_PROJECT_ROUTES.UPDATE_CLIP(id, clipId), payload)
}

export const deleteUgcClip = async (
  id: string,
  clipId: string,
): Promise<ApiResponse<{ project: UgcProject }>> => {
  return api.delete<{ project: UgcProject }>(UGC_PROJECT_ROUTES.DELETE_CLIP(id, clipId))
}

export const duplicateUgcClip = async (
  id: string,
  clipId: string,
): Promise<ApiResponse<{ project: UgcProject }>> => {
  return api.post<{ project: UgcProject }>(UGC_PROJECT_ROUTES.DUPLICATE_CLIP(id, clipId), {})
}

export const generateUgcStills = async (
  id: string,
  payload: GenerateUgcStillsPayload,
): Promise<ApiResponse<UgcGenerationHandle>> => {
  return api.post<UgcGenerationHandle>(UGC_PROJECT_ROUTES.GENERATE_STILLS(id, payload.clipId), payload)
}

export const generateUgcScript = async (
  id: string,
  clipId: string,
  payload?: GenerateUgcScriptPayload,
): Promise<ApiResponse<{ project: UgcProject }>> => {
  return api.post<{ project: UgcProject }>(UGC_PROJECT_ROUTES.GENERATE_SCRIPT(id, clipId), payload ?? {})
}

export const generateUgcVideos = async (
  id: string,
  payload: GenerateUgcVideosPayload,
): Promise<ApiResponse<UgcGenerationHandle>> => {
  return api.post<UgcGenerationHandle>(UGC_PROJECT_ROUTES.GENERATE_VIDEOS(id, payload.clipId), payload)
}

export const regenerateUgcStill = async (
  id: string,
  clipId: string,
  index: number,
  payload?: { skipEnhance?: boolean },
): Promise<ApiResponse<UgcGenerationHandle>> => {
  return api.post<UgcGenerationHandle>(UGC_PROJECT_ROUTES.REGENERATE_STILL(id, clipId, index), payload ?? {})
}

export const regenerateUgcVideo = async (
  id: string,
  clipId: string,
  payload?: GenerateUgcVideosPayload,
): Promise<ApiResponse<UgcGenerationHandle>> => {
  return api.post<UgcGenerationHandle>(UGC_PROJECT_ROUTES.REGENERATE_VIDEO(id, clipId), payload ?? { clipId })
}

export const openUgcClipEditor = async (
  id: string,
  clipId: string,
): Promise<ApiResponse<OpenUgcEditorResponse>> => {
  return api.post<OpenUgcEditorResponse>(UGC_PROJECT_ROUTES.OPEN_EDITOR(id, clipId), {})
}

export const generateUgcImageAd = async (
  id: string,
  payload: GenerateUgcImageAdPayload,
): Promise<ApiResponse<UgcGenerationHandle>> => {
  return api.post<UgcGenerationHandle>(UGC_PROJECT_ROUTES.GENERATE_IMAGE_AD(id, payload.clipId), payload)
}

export const assembleUgcProject = async (
  id: string,
): Promise<ApiResponse<UgcGenerationHandle>> => {
  return api.post<UgcGenerationHandle>(UGC_PROJECT_ROUTES.ASSEMBLE(id), {})
}

export const openUgcProjectEditor = async (
  id: string,
): Promise<ApiResponse<OpenUgcEditorResponse>> => {
  return api.post<OpenUgcEditorResponse>(UGC_PROJECT_ROUTES.OPEN_PROJECT_EDITOR(id), {})
}
