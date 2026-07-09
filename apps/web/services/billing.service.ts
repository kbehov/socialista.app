'use server'

import { getPolarProducts as loadPolarProducts } from '@/lib/polar/polar-products'
import type { ApiResponse, PolarProductsResponse } from '@socialista/types'

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
