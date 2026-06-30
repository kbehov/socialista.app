'use server'

import { MODEL_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type { ApiResponse, CreateModelInput, GetModelsResponse, Model, UpdateModelInput } from '@socialista/types'
import { revalidatePath } from 'next/cache'

const MODELS_PATH = '/manager/models'

export const getModels = async (query?: string): Promise<ApiResponse<GetModelsResponse>> => {
  return api.get<GetModelsResponse>(`${MODEL_ROUTES.GET_MODELS}${query ? `?${query}` : ''}`)
}

export const getModel = async (id: string): Promise<ApiResponse<Model>> => {
  return api.get<Model>(MODEL_ROUTES.GET_MODEL(id))
}

export const createModel = async (body: CreateModelInput): Promise<ApiResponse<Model>> => {
  const response = await api.post<Model>(MODEL_ROUTES.CREATE_MODEL, body)
  if (response.success) {
    revalidatePath(MODELS_PATH)
  }
  return response
}

export const updateModel = async (id: string, body: UpdateModelInput): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.put<{ message: string }>(MODEL_ROUTES.UPDATE_MODEL(id), body)
  if (response.success) {
    revalidatePath(MODELS_PATH)
  }
  return response
}

export const deleteModel = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<{ message: string }>(MODEL_ROUTES.DELETE_MODEL(id))
  if (response.success) {
    revalidatePath(MODELS_PATH)
  }
  return response
}
