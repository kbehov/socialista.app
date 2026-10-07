import type { ModelCompany } from './ai-company.types.js'
import {
  VIDEO_DURATION_AUTO,
  VIDEO_DURATION_MAX,
  VIDEO_RESOLUTION_COST_MULTIPLIERS,
  VIDEO_RESOLUTIONS,
  videoResolutionCostMultiplier,
  type VideoDuration,
} from './video-generation.types.js'

export enum ModelType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  TRANSCRIBE = 'transcribe',
  LIP_SYNC = 'lip-sync',
}

export enum CostUnit {
  TOKENS = 'tokens',
  PER_GENERATION = 'generation',
  PER_SECOND = 'second',
}

export enum ContextSupport {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  FILE = 'file',
}

export type ModelResolution = {
  value: string
  costPerSecond: number
}

export type Model = {
  _id: string
  value: string
  name: string
  cost: number
  usageCount?: number
  costUnit: CostUnit
  modelType: ModelType
  contextSupports?: ContextSupport[]
  resolutions?: ModelResolution[]
  supportsVideoReferences?: boolean
  allowedInUgc?: boolean
  modelProvider: string
  company?: ModelCompany
  createdAt: Date
  updatedAt: Date
}

export type GetModelsResponse = {
  models: Model[]
}

/** Public catalog row for marketing (landing page) — no pricing or internal fields. */
export type LandingModel = {
  _id: string
  name: string
  value: string
  modelType: ModelType
  modelProvider: string
  company?: ModelCompany
}

export type GetLandingModelsResponse = {
  models: LandingModel[]
  total: number
}

export type CreateModelInput = {
  value: string
  name: string
  cost: number
  costUnit: CostUnit
  modelType: ModelType
  contextSupports: ContextSupport[]
  resolutions?: ModelResolution[]
  supportsVideoReferences: boolean
  allowedInUgc: boolean
  modelProvider: string
  company: string
}

export type UpdateModelInput = Partial<CreateModelInput>

type VideoPricedModel = Pick<Model, 'cost' | 'costUnit' | 'resolutions'>

/** Resolutions the composer can offer. Falls back to 720p/1080p when the model has none stored. */
export function modelVideoResolutions(model: VideoPricedModel): ModelResolution[] {
  if (model.resolutions && model.resolutions.length > 0) return model.resolutions
  return VIDEO_RESOLUTIONS.map(value => ({
    value,
    costPerSecond: model.cost * VIDEO_RESOLUTION_COST_MULTIPLIERS[value],
  }))
}

/**
 * Credits charged per second at this resolution.
 * Uses the model's stored rate, then the per-second model cost, then the flat generation cost.
 */
export function videoCostPerSecond(model: VideoPricedModel, resolution?: string): number {
  const listed = model.resolutions?.find(entry => entry.value === resolution)?.costPerSecond
  if (listed != null) return listed
  return model.cost * videoResolutionCostMultiplier(resolution)
}

export function modelUsesPerSecondVideoPricing(model: VideoPricedModel, resolution?: string): boolean {
  if (model.resolutions?.some(entry => entry.value === resolution)) return true
  if ((model.resolutions?.length ?? 0) > 0) return true
  return model.costUnit === CostUnit.PER_SECOND
}

/** Credits for one clip. Auto duration is reserved at the 15s maximum. */
export function estimateVideoCredits(
  model: VideoPricedModel,
  resolution: string | undefined,
  duration: VideoDuration,
): number {
  const auto = duration === VIDEO_DURATION_AUTO
  if (auto || modelUsesPerSecondVideoPricing(model, resolution)) {
    const seconds = auto ? VIDEO_DURATION_MAX : duration
    return videoCostPerSecond(model, resolution) * seconds
  }
  return model.cost * videoResolutionCostMultiplier(resolution)
}
