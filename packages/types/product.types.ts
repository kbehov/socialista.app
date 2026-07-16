export type ProductData = {
  name?: string
  description?: string
  image?: string[]
  price?: string
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

export type GetProductsResponse = Product[]
