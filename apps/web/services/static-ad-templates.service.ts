'use server'

import { STATIC_AD_TEMPLATE_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  StaticAdTemplateCategoriesListResponse,
  StaticAdTemplateListResponse,
} from '@socialista/types'

export type GetStaticAdTemplatesQuery = {
  category?: string
  page?: number
  limit?: number
  sort?: string
}

export const getStaticAdTemplates = async (
  query?: GetStaticAdTemplatesQuery,
): Promise<ApiResponse<StaticAdTemplateListResponse>> => {
  const params = new URLSearchParams()
  if (query?.category) params.set('category', query.category)
  if (query?.page) params.set('page', String(query.page))
  if (query?.limit) params.set('limit', String(query.limit))
  if (query?.sort) params.set('sort', query.sort)

  const search = params.toString()
  const path = `${STATIC_AD_TEMPLATE_ROUTES.LIST}${search ? `?${search}` : ''}`
  return api.get<StaticAdTemplateListResponse>(path)
}

export const getStaticAdTemplateCategories = async (): Promise<
  ApiResponse<StaticAdTemplateCategoriesListResponse>
> => {
  return api.get<StaticAdTemplateCategoriesListResponse>(STATIC_AD_TEMPLATE_ROUTES.CATEGORIES)
}
