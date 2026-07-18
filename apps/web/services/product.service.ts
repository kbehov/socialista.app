'use server'

import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { PRODUCT_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type {
  ApiResponse,
  CreateProductPayload,
  ExtractProductResponse,
  GetProductsResponse,
  Product,
  UpdateProductPayload,
} from '@socialista/types'
import { revalidatePath } from 'next/cache'

const PRODUCTS_PATH = DASHBOARD_ROUTES.PRODUCTS

function revalidateProductPaths() {
  revalidatePath(PRODUCTS_PATH)
}

export const extractProduct = async (url: string): Promise<ApiResponse<ExtractProductResponse>> => {
  return api.post<ExtractProductResponse>(PRODUCT_ROUTES.EXTRACT_PRODUCT, { url })
}

export const createProduct = async (
  payload: CreateProductPayload,
): Promise<ApiResponse<{ product: Product }>> => {
  const response = await api.post<{ product: Product }>(PRODUCT_ROUTES.CREATE, payload)
  revalidateProductPaths()
  return response
}

export const getProduct = async (id: string): Promise<ApiResponse<{ product: Product }>> => {
  return api.get<{ product: Product }>(PRODUCT_ROUTES.GET_BY_ID(id))
}

export const getWorkspaceProducts = async (
  workspaceId: string,
  query?: { page?: number; limit?: number; sort?: string },
): Promise<ApiResponse<GetProductsResponse>> => {
  const params = new URLSearchParams()
  if (query?.page) params.set('page', String(query.page))
  if (query?.limit) params.set('limit', String(query.limit))
  if (query?.sort) params.set('sort', query.sort)

  const search = params.toString()
  const path = `${PRODUCT_ROUTES.GET_WORKSPACE_PRODUCTS(workspaceId)}${search ? `?${search}` : ''}`
  return api.get<GetProductsResponse>(path)
}

export const updateProduct = async (
  id: string,
  payload: UpdateProductPayload,
): Promise<ApiResponse<{ product: Product }>> => {
  const response = await api.patch<{ product: Product }>(PRODUCT_ROUTES.UPDATE(id), payload)
  revalidateProductPaths()
  return response
}

export const deleteProduct = async (id: string): Promise<ApiResponse<{ id: string }>> => {
  const response = await api.delete<{ id: string }>(PRODUCT_ROUTES.DELETE(id))
  revalidateProductPaths()
  return response
}
