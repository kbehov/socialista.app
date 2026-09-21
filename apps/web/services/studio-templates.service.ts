'use server'

import { STUDIO_TEMPLATE_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CreateStudioTemplateBody,
  CreateStudioTemplateCategoryBody,
  UpdateStudioTemplateCategoryBody,
  StudioTemplateCategoriesListResponse,
  StudioTemplateCategoryDto,
  StudioTemplateDto,
  StudioTemplateKind,
  StudioTemplateListResponse,
  UploadStudioTemplatePreviewResponse,
} from '@socialista/types'
import { revalidatePath, revalidateTag } from 'next/cache'

export type GetStudioTemplatesQuery = {
  kind: StudioTemplateKind
  category?: string
  page?: number
  limit?: number
  sort?: string
}

const TEMPLATES_PATH = '/manager/templates'
const TEMPLATE_CATEGORIES_PATH = '/manager/templates/categories'

function revalidateStudioTemplateCaches(kind?: StudioTemplateKind) {
  const kinds = kind ? [kind] : (['image', 'video'] as const)
  for (const k of kinds) {
    revalidateTag(`studio-templates-${k}`, 'max')
    revalidateTag(`studio-template-categories-${k}`, 'max')
  }
  revalidatePath(TEMPLATES_PATH)
  revalidatePath(TEMPLATE_CATEGORIES_PATH)
}

export const getStudioTemplates = async (
  query: GetStudioTemplatesQuery,
): Promise<ApiResponse<StudioTemplateListResponse>> => {
  const params = new URLSearchParams()
  params.set('kind', query.kind)
  if (query.category) params.set('category', query.category)
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.sort) params.set('sort', query.sort)

  const path = `${STUDIO_TEMPLATE_ROUTES.LIST}?${params.toString()}`
  return api.get<StudioTemplateListResponse>(path, {
    next: {
      revalidate: 3600,
      tags: [`studio-templates-${query.kind}`],
    },
  })
}

export const getStudioTemplateCategories = async (
  kind: StudioTemplateKind,
): Promise<ApiResponse<StudioTemplateCategoriesListResponse>> => {
  return api.get<StudioTemplateCategoriesListResponse>(
    `${STUDIO_TEMPLATE_ROUTES.CATEGORIES}?kind=${encodeURIComponent(kind)}`,
    {
      cache: 'no-store',
    },
  )
}

export const uploadStudioTemplatePreview = async (
  formData: FormData,
): Promise<ApiResponse<UploadStudioTemplatePreviewResponse>> => {
  return api.post<UploadStudioTemplatePreviewResponse>(STUDIO_TEMPLATE_ROUTES.UPLOAD_PREVIEW, formData)
}

export const createStudioTemplate = async (
  body: CreateStudioTemplateBody,
): Promise<ApiResponse<{ template: StudioTemplateDto }>> => {
  const response = await api.post<{ template: StudioTemplateDto }>(STUDIO_TEMPLATE_ROUTES.CREATE, body)
  if (response.success) {
    revalidateStudioTemplateCaches()
  }
  return response
}

export const deleteStudioTemplate = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<{ message: string }>(STUDIO_TEMPLATE_ROUTES.DELETE(id))
  if (response.success) {
    revalidateStudioTemplateCaches()
  }
  return response
}

export const createStudioTemplateCategory = async (
  body: CreateStudioTemplateCategoryBody,
): Promise<ApiResponse<{ category: StudioTemplateCategoryDto }>> => {
  const response = await api.post<{ category: StudioTemplateCategoryDto }>(
    STUDIO_TEMPLATE_ROUTES.CATEGORY_CREATE,
    body,
  )
  if (response.success) {
    revalidateStudioTemplateCaches()
  }
  return response
}

export const updateStudioTemplateCategory = async (
  id: string,
  body: UpdateStudioTemplateCategoryBody,
): Promise<ApiResponse<{ category: StudioTemplateCategoryDto }>> => {
  const response = await api.put<{ category: StudioTemplateCategoryDto }>(
    STUDIO_TEMPLATE_ROUTES.CATEGORY_UPDATE(id),
    body,
  )
  if (response.success) {
    revalidateStudioTemplateCaches()
  }
  return response
}

export const deleteStudioTemplateCategory = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await api.delete<{ message: string }>(STUDIO_TEMPLATE_ROUTES.CATEGORY_DELETE(id))
  if (response.success) {
    revalidateStudioTemplateCaches()
  }
  return response
}
