'use server'

import { STATIC_AD_TEMPLATE_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CreateStaticAdTemplateBody,
  CreateStaticAdTemplateCategoryBody,
  StaticAdTemplateCategoriesListResponse,
  StaticAdTemplateCategoryDto,
  StaticAdTemplateDto,
  StaticAdTemplateListResponse,
  UploadStaticAdTemplatePreviewResponse,
} from '@socialista/types'
import { revalidatePath, revalidateTag } from 'next/cache'

export type GetStaticAdTemplatesQuery = {
  category?: string
  page?: number
  limit?: number
  sort?: string
}

const TEMPLATES_PATH = '/manager/static-ad-templates'
const TEMPLATE_CATEGORIES_PATH = '/manager/static-ad-templates/categories'

function revalidateStaticAdTemplateCaches() {
  revalidateTag('static-ad-templates', 'max')
  revalidateTag('static-ad-template-categories', 'max')
  revalidatePath(TEMPLATES_PATH)
  revalidatePath(TEMPLATE_CATEGORIES_PATH)
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
  return api.get<StaticAdTemplateListResponse>(path, {
    next: {
      revalidate: 3600,
      tags: ['static-ad-templates'],
    },
  })
}

export const getStaticAdTemplateCategories = async (): Promise<
  ApiResponse<StaticAdTemplateCategoriesListResponse>
> => {
  return api.get<StaticAdTemplateCategoriesListResponse>(STATIC_AD_TEMPLATE_ROUTES.CATEGORIES, {
    next: {
      revalidate: 3600,
      tags: ['static-ad-template-categories'],
    },
  })
}

export const uploadStaticAdTemplatePreview = async (
  formData: FormData,
): Promise<ApiResponse<UploadStaticAdTemplatePreviewResponse>> => {
  return api.post<UploadStaticAdTemplatePreviewResponse>(STATIC_AD_TEMPLATE_ROUTES.UPLOAD_PREVIEW, formData)
}

export const createStaticAdTemplate = async (
  body: CreateStaticAdTemplateBody,
): Promise<ApiResponse<{ template: StaticAdTemplateDto }>> => {
  const response = await api.post<{ template: StaticAdTemplateDto }>(STATIC_AD_TEMPLATE_ROUTES.CREATE, body)
  if (response.success) {
    revalidateStaticAdTemplateCaches()
  }
  return response
}

export const deleteStaticAdTemplate = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<{ message: string }>(STATIC_AD_TEMPLATE_ROUTES.DELETE(id))
  if (response.success) {
    revalidateStaticAdTemplateCaches()
  }
  return response
}

export const createStaticAdTemplateCategory = async (
  body: CreateStaticAdTemplateCategoryBody,
): Promise<ApiResponse<{ category: StaticAdTemplateCategoryDto }>> => {
  const response = await api.post<{ category: StaticAdTemplateCategoryDto }>(
    STATIC_AD_TEMPLATE_ROUTES.CATEGORY_CREATE,
    body,
  )
  if (response.success) {
    revalidateStaticAdTemplateCaches()
  }
  return response
}

export const deleteStaticAdTemplateCategory = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<{ message: string }>(STATIC_AD_TEMPLATE_ROUTES.CATEGORY_DELETE(id))
  if (response.success) {
    revalidateStaticAdTemplateCaches()
  }
  return response
}
