import type { MetaResponse } from './common.types.js'

export type GenerationKind = 'image' | 'static-ad' | 'video'

export type GenerationStatus = 'running' | 'completed' | 'failed'

export type GenerationResultType = 'image' | 'video' | 'file'

export type GenerationAdCopy = {
  headline?: string
  subheadline?: string
  cta?: string
  brandName?: string
}

/** Kind-specific inputs; root stays stable as new task kinds are added. */
export type GenerationInputs = {
  aspectRatio?: string
  referenceImageUrl?: string
  productImageUrl?: string
  language?: string
  adCopy?: GenerationAdCopy
  [key: string]: unknown
}

export type GenerationResult = {
  type: GenerationResultType
  url: string
  thumbnailUrl?: string
  width?: number
  height?: number
  durationSec?: number
  mimeType?: string
  imageId?: string
  videoId?: string
}

export type Generation = {
  _id: string
  workspaceId: string
  createdBy: string
  kind: GenerationKind
  status: GenerationStatus
  taskId: string
  triggerRunId: string
  prompt?: string
  /** AI-enhanced / planned prompt used for the provider call, when applicable. */
  enhancedPrompt?: string
  model: string
  modelName?: string
  modelProvider?: string
  inputs?: GenerationInputs
  result?: GenerationResult
  cost: number
  creditsCharged: number
  errorMessage?: string
  startedAt: Date
  finishedAt?: Date
  durationMs?: number
  createdAt: Date
  updatedAt: Date
}

export type GetGenerationsResponse = {
  generations: Generation[]
  meta: MetaResponse
}
