'use server'

import { DASHBOARD_ROUTES, MANAGER_FILES_ROUTES } from '@/constants/app-routes'
import { FILES_API_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CollectionResponse,
  CreateCollectionPayload,
  DeleteFileResponse,
  DeleteFolderResponse,
  GetCollectionsResponse,
  GetImagesResponse,
  ImageResponse,
} from '@socialista/types'
import { revalidatePath } from 'next/cache'

function revalidateFilesPaths(folderId?: string) {
  revalidatePath(DASHBOARD_ROUTES.HOME)
  revalidatePath(MANAGER_FILES_ROUTES.HOME)

  if (folderId) {
    revalidatePath(DASHBOARD_ROUTES.folder(folderId))
    revalidatePath(MANAGER_FILES_ROUTES.folder(folderId))
  }
}

export const createFolder = async (payload: CreateCollectionPayload): Promise<ApiResponse<CollectionResponse>> => {
  const response = await api.post<CollectionResponse>(FILES_API_ROUTES.CREATE_FOLDER, payload)
  revalidateFilesPaths()
  return response
}

export const getFolders = async (): Promise<ApiResponse<GetCollectionsResponse>> => {
  return api.get<GetCollectionsResponse>(FILES_API_ROUTES.GET_FOLDERS, {
    next: {
      revalidate: 60,
      tags: ['workspace-folders'],
    },
  })
}

export const getFolderById = async (id: string): Promise<ApiResponse<CollectionResponse>> => {
  return api.get<CollectionResponse>(`${FILES_API_ROUTES.GET_FOLDERS}/${id}`)
}

export const getWorkspaceFiles = async (
  workspaceId: string,
  folderId?: string,
): Promise<ApiResponse<GetImagesResponse>> => {
  const params = new URLSearchParams()
  if (folderId) params.set('collectionId', folderId)
  const query = params.toString()
  const path = `${FILES_API_ROUTES.GET_WORKSPACE_FILES(workspaceId)}${query ? `?${query}` : ''}`
  return api.get<GetImagesResponse>(path, {
    next: {
      tags: ['workspace-files'],
    },
  })
}

export const uploadToWorkspace = async (
  workspaceId: string,
  formData: FormData,
): Promise<ApiResponse<ImageResponse>> => {
  const response = await api.post<ImageResponse>(FILES_API_ROUTES.UPLOAD_TO_WORKSPACE(workspaceId), formData)
  revalidateFilesPaths()
  return response
}

export const uploadToFolder = async (
  workspaceId: string,
  folderId: string,
  formData: FormData,
): Promise<ApiResponse<ImageResponse>> => {
  const response = await api.post<ImageResponse>(FILES_API_ROUTES.UPLOAD_TO_FOLDER(workspaceId, folderId), formData)
  revalidateFilesPaths(folderId)
  return response
}

export const deleteWorkspaceFile = async (
  workspaceId: string,
  fileId: string,
  folderId?: string,
): Promise<ApiResponse<DeleteFileResponse>> => {
  const response = await api.delete<DeleteFileResponse>(FILES_API_ROUTES.DELETE_FILE(workspaceId, fileId))
  revalidateFilesPaths(folderId)
  return response
}

export const deleteWorkspaceFolder = async (
  workspaceId: string,
  folderId: string,
): Promise<ApiResponse<DeleteFolderResponse>> => {
  const response = await api.delete<DeleteFolderResponse>(FILES_API_ROUTES.DELETE_FOLDER(workspaceId, folderId))
  revalidateFilesPaths(folderId)
  return response
}
