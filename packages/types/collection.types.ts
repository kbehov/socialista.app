import type { MetaResponse } from './common.types.js'
export type CreateCollectionPayload = {
  name: string
  isPublic: boolean
  workspaceId?: string
}

export type CollectionResponse = {
  _id: string
  name: string
  isPublic: boolean
  workspaceId?: string
  createdBy: string
  imagesCount: number
  createdAt: Date
  updatedAt: Date
}

export type GetCollectionsResponse = {
  collections: CollectionResponse[]
  meta: MetaResponse
}

export type ImageResponse = {
  _id: string
  url: string
  width: number
  height: number
  key: string
  size?: number
  workspace: string
  collection?: string
  uploadedBy?: string
  createdAt: Date
  updatedAt: Date
}

export type DeleteFileResponse = {
  id: string
  freedBytes: number
}

export type DeleteFolderResponse = {
  id: string
  freedBytes: number
  deletedFiles: number
}

export type GetImagesResponse = {
  images: ImageResponse[]
  meta: {
    total: number
    page: number
    limit: number
    hasNextPage?: boolean
    hasPreviousPage?: boolean
  }
}
