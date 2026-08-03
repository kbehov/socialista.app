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
export type GenerateImageOptions = {
  model: string
  prompt: string
  aspectRatio: AspectRatio
  workspaceId: string
  userId: string
  imageUrl?: string
  imageUrls?: string[]
  onProgress?: (progress: number, label: string) => void
}

export type GeneratedImage = {
  url: string
  width: number
  height: number
  content_type: string
  file_name?: string
}

export type EditImageResult = { success: true; data: GeneratedImage } | { success: false; error: string }

export type GeneratedVideo = {
  url: string
  content_type?: string
  file_name?: string
}

export type EditVideoResolution = 'auto' | '480p' | '720p'

export type EditVideoResult = { success: true; data: GeneratedVideo } | { success: false; error: string }

export type AnimateImageResult = { success: true; data: GeneratedVideo } | { success: false; error: string }
