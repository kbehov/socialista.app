import type { HydratedDocument, Types } from 'mongoose'

export enum UgcProjectStatus {
  DRAFT = 'draft',
  GENERATING = 'generating',
  READY = 'ready',
  FAILED = 'failed',
}

export enum UgcVariantStatus {
  IDLE = 'idle',
  QUEUED = 'queued',
  GENERATING = 'generating',
  READY = 'ready',
  FAILED = 'failed',
}

export enum UgcScriptSource {
  USER = 'user',
  AI = 'ai',
}

export type UgcSceneCount = 1 | 2 | 3

export interface IUgcProjectModels {
  image: string
  script?: string
  video: string
  planner?: string
}

export interface IUgcProjectScript {
  text: string
  source: UgcScriptSource
}

export interface IUgcSceneStill {
  index: number
  imageUrl?: string
  generationId?: string
}

export interface IUgcVariant {
  id: string
  influencerId: Types.ObjectId
  status: UgcVariantStatus
  stills: IUgcSceneStill[]
  plannedPrompt?: string
  negativePrompt?: string
  videoUrl?: string
  thumbnailUrl?: string
  generationId?: string
  composedVideoId?: Types.ObjectId
  error?: string
}

export interface IUgcProject {
  _id: Types.ObjectId
  name: string
  status: UgcProjectStatus
  workspace: Types.ObjectId
  createdBy: Types.ObjectId
  productId?: Types.ObjectId
  productImageUrls: string[]
  productName?: string
  influencerIds: Types.ObjectId[]
  sceneCount: UgcSceneCount
  aspectRatio: string
  models: IUgcProjectModels
  script: IUgcProjectScript
  directions?: string
  variants: IUgcVariant[]
  stillsRunId?: string
  videoRunId?: string
  error?: string
  createdAt: Date
  updatedAt: Date
}

export type UgcProjectDocument = HydratedDocument<IUgcProject>
