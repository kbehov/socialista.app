'use server'

import { PRESET_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CreatePresetPayload,
  GetPresetsResponse,
  PresetKind,
  PresetResponse,
  UpdatePresetPayload,
} from '@socialista/types'

export type GetPresetsQuery = {
  kind?: PresetKind
  active?: boolean
  page?: number
  limit?: number
  sort?: string
}

export const getPresets = async (
  query?: GetPresetsQuery,
): Promise<ApiResponse<GetPresetsResponse>> => {
  const params = new URLSearchParams()
  if (query?.kind) params.set('kind', query.kind)
  if (query?.active !== undefined) params.set('active', String(query.active))
  if (query?.page) params.set('page', String(query.page))
  if (query?.limit) params.set('limit', String(query.limit))
  if (query?.sort) params.set('sort', query.sort)

  const search = params.toString()
  const path = `${PRESET_ROUTES.LIST}${search ? `?${search}` : ''}`
  return api.get<GetPresetsResponse>(path)
}

export const getPreset = async (id: string): Promise<ApiResponse<PresetResponse>> => {
  return api.get<PresetResponse>(PRESET_ROUTES.GET_BY_ID(id))
}

export const createPreset = async (
  payload: CreatePresetPayload,
): Promise<ApiResponse<PresetResponse>> => {
  return api.post<PresetResponse>(PRESET_ROUTES.CREATE, payload)
}

export const updatePreset = async (
  id: string,
  payload: UpdatePresetPayload,
): Promise<ApiResponse<PresetResponse>> => {
  return api.patch<PresetResponse>(PRESET_ROUTES.UPDATE(id), payload)
}

export const deletePreset = async (id: string): Promise<ApiResponse<{ id: string }>> => {
  return api.delete<{ id: string }>(PRESET_ROUTES.DELETE(id))
}
