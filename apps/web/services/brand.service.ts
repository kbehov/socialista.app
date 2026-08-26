'use server'

import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { BRAND_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  BrandResponse,
  CreateBrandPayload,
  GetBrandsResponse,
  UpdateBrandPayload,
} from '@socialista/types'
import { revalidatePath } from 'next/cache'

function revalidateBrandPaths() {
  revalidatePath(DASHBOARD_ROUTES.BRANDS)
}

export const createBrand = async (payload: CreateBrandPayload): Promise<ApiResponse<BrandResponse>> => {
  const response = await api.post<BrandResponse>(BRAND_ROUTES.CREATE, payload)
  revalidateBrandPaths()
  return response
}

export const getBrand = async (id: string): Promise<ApiResponse<BrandResponse>> => {
  return api.get<BrandResponse>(BRAND_ROUTES.GET_BY_ID(id))
}

export const getWorkspaceBrands = async (
  workspaceId: string,
  query?: { page?: number; limit?: number; sort?: string; projectId?: string },
): Promise<ApiResponse<GetBrandsResponse>> => {
  const params = new URLSearchParams()
  if (query?.page) params.set('page', String(query.page))
  if (query?.limit) params.set('limit', String(query.limit))
  if (query?.sort) params.set('sort', query.sort)
  if (query?.projectId) params.set('project', query.projectId)

  const search = params.toString()
  const path = `${BRAND_ROUTES.GET_WORKSPACE_BRANDS(workspaceId)}${search ? `?${search}` : ''}`
  return api.get<GetBrandsResponse>(path)
}

export const updateBrand = async (id: string, payload: UpdateBrandPayload): Promise<ApiResponse<BrandResponse>> => {
  const response = await api.patch<BrandResponse>(BRAND_ROUTES.UPDATE(id), payload)
  revalidateBrandPaths()
  return response
}

export const deleteBrand = async (id: string): Promise<ApiResponse<{ id: string }>> => {
  const response = await api.delete<{ id: string }>(BRAND_ROUTES.DELETE(id))
  revalidateBrandPaths()
  return response
}
