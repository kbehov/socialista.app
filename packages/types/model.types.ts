import type { MetaResponse } from './common.types.js'

export enum ModelType {
  VIDEO = 'video',
  AUDIO = 'audio',
  IMAGE = 'image',
  TEXT = 'text',
}

export enum CostUnit {
  TOKENS = 'tokens',
  PER_GENERATION = 'generation',
  PER_SECOND = 'second',
}

export type Model = {
  _id: string
  name: string
  cost: number
  costUnit: CostUnit
  modelType: ModelType
  modelProvider: string
  createdAt: Date
  updatedAt: Date
}

export type GetModelsResponse = {
  models: Model[]
  meta: MetaResponse
}

export type CreateModelInput = {
  name: string
  cost: number
  costUnit: CostUnit
  modelType: ModelType
  modelProvider: string
}

export type UpdateModelInput = Partial<CreateModelInput>
