import { PRODUCT_ROUTES } from '@/constants/routes'
import { api } from '@/lib/api'
import type { ApiResponse, ExtractProductResponse, GetProductsResponse, Product } from '@socialista/types'

export const extractProduct = async (url: string) => {
  return api.post<ExtractProductResponse>(PRODUCT_ROUTES.EXTRACT_PRODUCT, {
    url,
  })
}

export const getProducts = async (): Promise<ApiResponse<GetProductsResponse>> => {
  return api.get<GetProductsResponse>(PRODUCT_ROUTES.GET_PRODUCTS)
}

export const getProductById = async (id: string): Promise<ApiResponse<Product | null>> => {
  return api.get<Product | null>(PRODUCT_ROUTES.GET_PRODUCT(id))
}
