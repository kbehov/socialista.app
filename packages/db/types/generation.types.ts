import type { HydratedDocument, Types } from 'mongoose'

export enum GenerationKind {
  IMAGE = 'image',
  STATIC_AD = 'static-ad',
  VIDEO = 'video',
}

export enum GenerationStatus {
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum GenerationResultType {
  IMAGE = 'image',
  VIDEO = 'video',
  FILE = 'file',
}

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

export interface IGeneration {
  _id: Types.ObjectId
  workspace: Types.ObjectId
  createdBy: Types.ObjectId
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

export type GenerationDocument = HydratedDocument<IGeneration>

export type CreateGenerationInput = {
  workspace: string
  createdBy: string
  kind: GenerationKind
  status?: GenerationStatus
  taskId: string
  triggerRunId: string
  prompt?: string
  enhancedPrompt?: string
  model: string
  modelName?: string
  modelProvider?: string
  inputs?: GenerationInputs
  result?: GenerationResult
  cost?: number
  creditsCharged?: number
  errorMessage?: string
  startedAt?: Date
  finishedAt?: Date
  durationMs?: number
}

export type UpdateGenerationInput = {
  status?: GenerationStatus
  prompt?: string
  enhancedPrompt?: string | null
  model?: string
  modelName?: string
  modelProvider?: string
  inputs?: GenerationInputs
  result?: GenerationResult
  cost?: number
  creditsCharged?: number
  errorMessage?: string | null
  finishedAt?: Date | null
  durationMs?: number | null
}
