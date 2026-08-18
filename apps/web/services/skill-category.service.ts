'use server'

import { SKILL_CATEGORY_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CreateSkillCategoryPayload,
  GetSkillCategoriesResponse,
  GetSkillCategoryResponse,
  SkillCategory,
  UpdateSkillCategoryPayload,
} from '@socialista/types'

export const createSkillCategory = async (
  payload: CreateSkillCategoryPayload,
): Promise<ApiResponse<{ category: SkillCategory }>> => {
  return api.post<{ category: SkillCategory }>(SKILL_CATEGORY_ROUTES.CREATE, payload)
}

export const getSkillCategory = async (
  id: string,
): Promise<ApiResponse<GetSkillCategoryResponse>> => {
  return api.get<GetSkillCategoryResponse>(SKILL_CATEGORY_ROUTES.GET_BY_ID(id))
}

export const getWorkspaceSkillCategories = async (
  workspaceId: string,
  query?: {
    page?: number
    limit?: number
    sort?: string
    status?: string
    query?: string
  },
): Promise<ApiResponse<GetSkillCategoriesResponse>> => {
  const params = new URLSearchParams()
  if (query?.page) params.set('page', String(query.page))
  if (query?.limit) params.set('limit', String(query.limit))
  if (query?.sort) params.set('sort', query.sort)
  if (query?.status) params.set('status', query.status)
  if (query?.query) params.set('query', query.query)

  const search = params.toString()
  const path = `${SKILL_CATEGORY_ROUTES.GET_WORKSPACE_CATEGORIES(workspaceId)}${search ? `?${search}` : ''}`
  return api.get<GetSkillCategoriesResponse>(path)
}

export const updateSkillCategory = async (
  id: string,
  payload: UpdateSkillCategoryPayload,
): Promise<ApiResponse<{ category: SkillCategory }>> => {
  return api.patch<{ category: SkillCategory }>(SKILL_CATEGORY_ROUTES.UPDATE(id), payload)
}

export const deleteSkillCategory = async (id: string): Promise<ApiResponse<{ id: string }>> => {
  return api.delete<{ id: string }>(SKILL_CATEGORY_ROUTES.DELETE(id))
}
