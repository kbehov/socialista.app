import { MODEL_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type { ApiResponse, GetModelsResponse, Model } from '@socialista/types'

export const getModels = async (): Promise<ApiResponse<GetModelsResponse>> => {
  const response = await api.get<GetModelsResponse>(MODEL_ROUTES.GET_MODELS)
  return response
}

export const getModel = async (id: string): Promise<ApiResponse<Model>> => {
  const response = await api.get<Model>(MODEL_ROUTES.GET_MODEL(id))
  return response
}

export const createModel = async (model: Model): Promise<ApiResponse<Model>> => {
  const response = await api.post<Model>(MODEL_ROUTES.CREATE_MODEL, model)
  return response
}

export const updateModel = async (id: string, model: Model): Promise<ApiResponse<void>> => {
  const response = await api.put<void>(MODEL_ROUTES.UPDATE_MODEL(id), model)
  return response
}

export const deleteModel = async (id: string): Promise<ApiResponse<void>> => {
  const response = await api.delete<void>(MODEL_ROUTES.DELETE_MODEL(id))
  return response
}
