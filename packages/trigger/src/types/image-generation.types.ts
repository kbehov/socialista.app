import { ImageGenerationPayload } from '../trigger/index.js'

export type ImageGenerationStatus = {
  progress: number
  label: string
}

export type ImageGenerationError = {
  message: string
}

export type ImageGenerationOutput = {
  imageUrl: string
  cost: number
}

export type ImageGenerator = (options: {
  model: string
  prompt: string
  aspectRatio: ImageGenerationPayload['aspectRatio']
  workspaceId: string
  userId: string
  imageUrl?: string
  onProgress?: (progress: number, label: string) => void
}) => Promise<string>
