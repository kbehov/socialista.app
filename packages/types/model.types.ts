import type { ModelCompany } from './ai-company.types.js'

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
  allowedInUgc: boolean
  modelProvider: string
  company: string
}

export type UpdateModelInput = Partial<CreateModelInput>
