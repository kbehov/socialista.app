'use server'

import { INSPIRATION_ROUTES, inspirationRoute } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CreateInspirationCategoryInput,
  CreateInspirationNicheInput,
  InspirationCategoriesListResponse,
  InspirationCategoryResponse,
  InspirationNicheResponse,
  InspirationNichesListResponse,
  InspirationResponse,
  InspirationsListResponse,
  UpdateInspirationCategoryInput,
  UpdateInspirationNicheInput,
} from '@socialista/types'
import { revalidatePath } from 'next/cache'

const INSPIRATIONS_PATH = '/manager/inspirations'

function withQuery(path: string, query?: string) {
  return query ? `${path}?${query}` : path
}

export const getInspirations = async (query?: string): Promise<ApiResponse<InspirationsListResponse>> => {
  return api.get<InspirationsListResponse>(withQuery(INSPIRATION_ROUTES.GET_INSPIRATIONS, query))
}

export const createInspiration = async (
  body: Record<string, unknown>,
): Promise<ApiResponse<{ inspiration: InspirationResponse }>> => {
  const response = await api.post<{ inspiration: InspirationResponse }>(INSPIRATION_ROUTES.CREATE_INSPIRATION, body)
  revalidatePath(INSPIRATIONS_PATH)
  return response
}

export const updateInspiration = async (
  id: string,
  body: Record<string, unknown>,
): Promise<ApiResponse<{ inspiration: InspirationResponse }>> => {
  const response = await api.put<{ inspiration: InspirationResponse }>(
    inspirationRoute(INSPIRATION_ROUTES.UPDATE_INSPIRATION, id),
    body,
  )
  revalidatePath(INSPIRATIONS_PATH)
  return response
}

export const deleteInspiration = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<{ message: string }>(inspirationRoute(INSPIRATION_ROUTES.DELETE_INSPIRATION, id))
  revalidatePath(INSPIRATIONS_PATH)
  return response
}

export const getInspirationCategories = async (
  query?: string,
): Promise<ApiResponse<InspirationCategoriesListResponse>> => {
  return api.get<InspirationCategoriesListResponse>(withQuery(INSPIRATION_ROUTES.GET_CATEGORIES, query))
}

export const createInspirationCategory = async (
  body: CreateInspirationCategoryInput,
): Promise<ApiResponse<{ category: InspirationCategoryResponse }>> => {
  const response = await api.post<{ category: InspirationCategoryResponse }>(INSPIRATION_ROUTES.CREATE_CATEGORY, {
    name: body.name,
    icon: body.icon ?? '',
    count: 0,
  })
  revalidatePath(INSPIRATIONS_PATH)
  return response
}

export const updateInspirationCategory = async (
  id: string,
  body: UpdateInspirationCategoryInput,
): Promise<ApiResponse<{ category: InspirationCategoryResponse }>> => {
  const response = await api.put<{ category: InspirationCategoryResponse }>(
    inspirationRoute(INSPIRATION_ROUTES.UPDATE_CATEGORY, id),
    body,
  )
  revalidatePath(INSPIRATIONS_PATH)
  return response
}

export const deleteInspirationCategory = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<{ message: string }>(inspirationRoute(INSPIRATION_ROUTES.DELETE_CATEGORY, id))
  revalidatePath(INSPIRATIONS_PATH)
  return response
}

export const getInspirationNiches = async (query?: string): Promise<ApiResponse<InspirationNichesListResponse>> => {
  return api.get<InspirationNichesListResponse>(withQuery(INSPIRATION_ROUTES.GET_NICHES, query))
}

export const createInspirationNiche = async (
  body: CreateInspirationNicheInput,
): Promise<ApiResponse<{ niche: InspirationNicheResponse }>> => {
  const response = await api.post<{ niche: InspirationNicheResponse }>(INSPIRATION_ROUTES.CREATE_NICHE, {
    name: body.name,
    icon: body.icon ?? '',
    count: 0,
  })
  revalidatePath(INSPIRATIONS_PATH)
  return response
}

export const updateInspirationNiche = async (
  id: string,
  body: UpdateInspirationNicheInput,
): Promise<ApiResponse<{ niche: InspirationNicheResponse }>> => {
  const response = await api.put<{ niche: InspirationNicheResponse }>(
    inspirationRoute(INSPIRATION_ROUTES.UPDATE_NICHE, id),
    body,
  )
  revalidatePath(INSPIRATIONS_PATH)
  return response
}

export const deleteInspirationNiche = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<{ message: string }>(inspirationRoute(INSPIRATION_ROUTES.DELETE_NICHE, id))
  revalidatePath(INSPIRATIONS_PATH)
  return response
}
