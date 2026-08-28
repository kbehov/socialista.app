export enum ModelType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  TRANSCRIBE = 'transcribe',
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

export type Model = {
  _id: string
  chef: string
  value: string
  name: string
  cost: number
  costUnit: CostUnit
  modelType: ModelType
  contextSupports?: ContextSupport[]
  modelProvider: string
  createdAt: Date
  updatedAt: Date
}

export type GetModelsResponse = {
  models: Model[]
}

export type CreateModelInput = {
  chef: string
  value: string
  name: string
  cost: number
  costUnit: CostUnit
  modelType: ModelType
  contextSupports: ContextSupport[]
  modelProvider: string
}

export type UpdateModelInput = Partial<CreateModelInput>
