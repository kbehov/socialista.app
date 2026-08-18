import type { HydratedDocument, Types } from 'mongoose'

export enum UgcProjectStatus {
  DRAFT = 'draft',
  GENERATING = 'generating',
  READY = 'ready',
  FAILED = 'failed',
}

export enum UgcClipStatus {
  IDLE = 'idle',
  QUEUED = 'queued',
  GENERATING = 'generating',
  READY = 'ready',
  FAILED = 'failed',
}

/** @deprecated Use UgcClipStatus. */
export const UgcVariantStatus = UgcClipStatus
export type UgcVariantStatus = UgcClipStatus

export enum UgcScriptSource {
  USER = 'user',
  AI = 'ai',
}

export enum UgcClipType {
  TALKING = 'talking',
  B_ROLL = 'b-roll',
  UNBOXING = 'unboxing',
  TRY_ON = 'try-on',
  PRODUCT_HOLD = 'product-hold',
  APP_SHOWCASE = 'app-showcase',
}

export enum UgcVoiceProvider {
  ELEVENLABS = 'elevenlabs',
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

export interface IUgcClipModels {
  image?: string
  script?: string
  video?: string
  planner?: string
}

export interface IUgcClipVoice {
  provider: UgcVoiceProvider
  voiceId?: string
  voiceName?: string
  speed?: number
  stability?: number
  enabled?: boolean
}

export interface IUgcSceneStill {
  index: number
  imageUrl?: string
  generationId?: string
  enhancedPrompt?: string
}

export interface IUgcClip {
  id: string
  type: UgcClipType
  name?: string
  status: UgcClipStatus
  durationSec: number
  sceneCount?: UgcSceneCount
  influencerId?: Types.ObjectId
  script?: IUgcProjectScript
  voice?: IUgcClipVoice
  models?: IUgcClipModels
  scenePrompt?: string
  directions?: string
  referenceImageUrls?: string[]
  stills: IUgcSceneStill[]
  plannedPrompt?: string
  negativePrompt?: string
  videoUrl?: string
  thumbnailUrl?: string
  generationId?: string
  composedVideoId?: Types.ObjectId
  stillsRunId?: string
  videoRunId?: string
  imageAdUrl?: string
  imageAdGenerationId?: string
  imageAdRunId?: string
  error?: string
}

/** @deprecated Older influencer-variant shape. Prefer IUgcClip. */
export interface IUgcVariant {
  id: string
  influencerId: Types.ObjectId
  status: UgcClipStatus
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
  influencerId?: Types.ObjectId
  aspectRatio: string
  models: IUgcProjectModels
  clips: IUgcClip[]
  assembledVideoUrl?: string
  assembledGenerationId?: string
  assembledRunId?: string
  composedProjectVideoId?: Types.ObjectId
  error?: string
  createdAt: Date
  updatedAt: Date
  /** Legacy fields kept so older documents still load. */
  influencerIds?: Types.ObjectId[]
  sceneCount?: UgcSceneCount
  script?: IUgcProjectScript
  directions?: string
  variants?: IUgcVariant[]
  stillsRunId?: string
  videoRunId?: string
}

export type UgcProjectDocument = HydratedDocument<IUgcProject>
