export const BRAND_NAME_MAX = 80
export const BRAND_DESCRIPTION_MAX = 480
export const BRAND_INDUSTRY_MAX = 80
export const BRAND_COLORS_MAX = 12

export type Brand = {
  _id: string
  workspaceId: string
  projectId?: string
  name: string
  description?: string
  industry?: string
  website?: string
  logo?: string
  colors: string[]
  createdAt: Date
  updatedAt: Date
}

export type CreateBrandPayload = {
  workspaceId: string
  projectId?: string
  name: string
  description?: string
  industry?: string
  website?: string
  logo?: string
  colors?: string[]
}

export type UpdateBrandPayload = {
  name?: string
  description?: string
  industry?: string
  website?: string
  logo?: string
  colors?: string[]
}

export type BrandResponse = {
  brand: Brand
}

export type GetBrandsResponse = {
  brands: Brand[]
}

export type ExtractBrandPayload = {
  url: string
}

export type ExtractBrandResponse = {
  name: string
  description: string
  industry: string
  website: string
  logo?: string
  colors: string[]
}
