import type { MetaResponse } from './common.types.js'

export type ProductData = {
  name?: string
  description?: string
  image?: string[]
  price?: string | number
  currency?: string
  availability?: string
  sku?: string
  brand?: string
  url: string
}

export type ExtractProductResponse = ProductData

export type Product = {
  _id: string
  workspaceId: string
  name: string
  images: string[]
  description: string
  url: string
  price: number
  createdAt: Date
  updatedAt: Date
}

export type CreateProductPayload = {
  workspaceId: string
  name: string
  description?: string
  url: string
  price: number
  images?: string[]
}

export type UpdateProductPayload = {
  name?: string
  description?: string
  url?: string
  price?: number
  images?: string[]
}

export type GetProductsResponse = {
  products: Product[]
  meta: MetaResponse
}
