import { AspectRatio } from './image-generation.types.js'

export type SanitizedMedia = {
  imageUrl: string
}

export type GenerateImagePayload = {
  prompt: string
  media?: SanitizedMedia[]
}

export type UploadGeneratedImageInput = {
  workspaceId: string
  userId: string
  bytes: Uint8Array
  mediaType: string
  filename?: string
}

export type UploadGeneratedImageResponse = {
  success: boolean
  data?: {
    url: string
    _id: string
  }
  message?: string
}
export type GenerateVercelImageOptions = {
  model: string
  prompt: string
  aspectRatio: AspectRatio
  workspaceId: string
  userId: string
  imageUrl?: string
  imageUrls?: string[]
  onProgress?: (progress: number, label: string) => void
}
