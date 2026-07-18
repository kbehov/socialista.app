export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3'

export const ASPECT_RATIOS = ['1:1', '16:9', '9:16', '4:3'] as const satisfies readonly AspectRatio[]

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
  aspectRatio: AspectRatio
  workspaceId: string
  userId: string
  imageUrl?: string
  imageUrls?: string[]
  onProgress?: (progress: number, label: string) => void
}) => Promise<string>

export const TASK_IDS = {
  imageGeneration: 'realtime-image-generation',
  staticAdGeneration: 'realtime-static-ad-generation',
} as const

export type TaskId = (typeof TASK_IDS)[keyof typeof TASK_IDS]

export const STATIC_AD_MODEL = 'openai/gpt-image-2' as const
