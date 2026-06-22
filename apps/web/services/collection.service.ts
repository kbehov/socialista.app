'use server'

import { DASHBOARD_ROUTES, MANAGER_FILES_ROUTES } from '@/constants/app-routes'
import { COLLECTION_ROUTES } from '@/constants/routes'
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

export const createCollection = async (payload: CreateCollectionPayload): Promise<ApiResponse<CollectionResponse>> => {
  const response = await api.post<CollectionResponse>(COLLECTION_ROUTES.CREATE_COLLECTION, payload)
  revalidateFilesPaths()
  return response
}

export const getCollections = async (): Promise<ApiResponse<GetCollectionsResponse>> => {
  return api.get<GetCollectionsResponse>(COLLECTION_ROUTES.GET_COLLECTIONS)
}

export const getCollectionById = async (id: string): Promise<ApiResponse<CollectionResponse>> => {
  return api.get<CollectionResponse>(`${COLLECTION_ROUTES.GET_COLLECTIONS}/${id}`)
}

// Fetch images for a workspace. Pass collectionId to filter by a specific collection.
export const getWorkspaceImages = async (
  workspaceId: string,
  collectionId?: string,
): Promise<ApiResponse<GetImagesResponse>> => {
  const params = new URLSearchParams()
  if (collectionId) params.set('collection', collectionId)
  const query = params.toString()
  const path = `${COLLECTION_ROUTES.GET_WORKSPACE_IMAGES(workspaceId)}${query ? `?${query}` : ''}`
  return api.get<GetImagesResponse>(path)
}

// Upload a file to the workspace root (no collection).
export const uploadToWorkspace = async (
  workspaceId: string,
  formData: FormData,
): Promise<ApiResponse<ImageResponse>> => {
  const response = await api.post<ImageResponse>(COLLECTION_ROUTES.UPLOAD_TO_WORKSPACE(workspaceId), formData)
  revalidateFilesPaths()
  return response
}

// Upload a file to a specific collection.
export const uploadToCollection = async (
  workspaceId: string,
  collectionId: string,
  formData: FormData,
): Promise<ApiResponse<ImageResponse>> => {
  const response = await api.post<ImageResponse>(
    COLLECTION_ROUTES.UPLOAD_TO_COLLECTION(workspaceId, collectionId),
    formData,
  )
  revalidateFilesPaths(collectionId)
  return response
}

export const deleteWorkspaceFile = async (
  workspaceId: string,
  fileId: string,
  folderId?: string,
): Promise<ApiResponse<DeleteFileResponse>> => {
  const response = await api.delete<DeleteFileResponse>(COLLECTION_ROUTES.DELETE_FILE(workspaceId, fileId))
  revalidateFilesPaths(folderId)
  return response
}

export const deleteWorkspaceFolder = async (
  workspaceId: string,
  folderId: string,
): Promise<ApiResponse<DeleteFolderResponse>> => {
  const response = await api.delete<DeleteFolderResponse>(COLLECTION_ROUTES.DELETE_FOLDER(workspaceId, folderId))
  revalidateFilesPaths(folderId)
  return response
}
