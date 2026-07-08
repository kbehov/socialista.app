'use server'

import { getPolarProductById, getPolarProducts as loadPolarProducts } from '@/lib/polar-products'
import type { ApiResponse, PolarProduct, PolarProductsResponse } from '@socialista/types'

type GetPolarProductsOptions = {
  recurringOnly?: boolean
}

export const getPolarProducts = async (
  options: GetPolarProductsOptions = {},
): Promise<ApiResponse<PolarProductsResponse>> => {
  try {
    const products = await loadPolarProducts(options)
    return { success: true, data: { products } }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to load Polar products',
    }
  }
}

export const getPolarProduct = async (productId: string): Promise<ApiResponse<{ product: PolarProduct }>> => {
  if (!productId.trim()) {
    return { success: false, message: 'Product ID is required' }
  }

  try {
    const product = await getPolarProductById(productId.trim())

    if (!product) {
      return { success: false, message: 'Product not found' }
    }

    return { success: true, data: { product } }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to load Polar product',
    }
  }
}
