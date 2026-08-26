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
