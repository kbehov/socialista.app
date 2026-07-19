'use server'

import { GENERATION_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  Generation,
  GenerationKind,
  GenerationStatus,
  GetGenerationsResponse,
} from '@socialista/types'

export type GetWorkspaceGenerationsQuery = {
  page?: number
  limit?: number
  sort?: string
  kind?: GenerationKind
  status?: GenerationStatus
  createdBy?: string
}

export const getGeneration = async (
  id: string,
): Promise<ApiResponse<{ generation: Generation }>> => {
  return api.get<{ generation: Generation }>(GENERATION_ROUTES.GET_BY_ID(id))
}

export const getWorkspaceGenerations = async (
  workspaceId: string,
  query?: GetWorkspaceGenerationsQuery,
): Promise<ApiResponse<GetGenerationsResponse>> => {
  const params = new URLSearchParams()
  if (query?.page) params.set('page', String(query.page))
  if (query?.limit) params.set('limit', String(query.limit))
  if (query?.sort) params.set('sort', query.sort)
  if (query?.kind) params.set('kind', query.kind)
  if (query?.status) params.set('status', query.status)
  if (query?.createdBy) params.set('createdBy', query.createdBy)

  const search = params.toString()
  const path = `${GENERATION_ROUTES.GET_WORKSPACE_GENERATIONS(workspaceId)}${search ? `?${search}` : ''}`
  return api.get<GetGenerationsResponse>(path)
}
