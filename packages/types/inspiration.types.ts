import type { MetaResponse } from './common.types.js'

export type InspirationResponse = {
  _id: string
  url: string
  contentType: 'slideshow' | 'video'
  images: {
    url: string
    width?: number
    height?: number
  }[]
  author: {
    username?: string
    nickName?: string
    avatarUrl?: string
  }
  stats: {
    likes: number
    comments: number
    shares: number
    plays: number
  }
  video: {
    playUrl?: string
    coverUrl?: string
    downloadUrl?: string
    duration?: number
    width?: number
    height?: number
  }
  categories: {
    name: string
    icon?: string
  }[]
  niches: {
    name: string
    icon?: string
  }[]
  views: number
  createdAt: Date
  updatedAt: Date
}

export type InspirationCategoryResponse = {
  _id: string
  name: string
  icon?: string
  count?: number
  createdAt: Date
  updatedAt: Date
}

export type InspirationNicheResponse = {
  _id: string
  name: string
  icon?: string
  count?: number
  createdAt: Date
  updatedAt: Date
}

export type InspirationsListResponse = {
  inspirations: InspirationResponse[]
  meta: MetaResponse
}

export type InspirationCategoriesListResponse = {
  categories: InspirationCategoryResponse[]
  meta: MetaResponse
}

export type InspirationNichesListResponse = {
  niches: InspirationNicheResponse[]
  meta: MetaResponse
}

/** @deprecated Use InspirationsListResponse */
export type InspirationsReponse = InspirationsListResponse

export type CreateInspirationCategoryInput = {
  name: string
  icon?: string
}

export type CreateInspirationNicheInput = {
  name: string
  icon?: string
}

export type UpdateInspirationCategoryInput = Partial<CreateInspirationCategoryInput>

export type UpdateInspirationNicheInput = Partial<CreateInspirationNicheInput>
