export enum ModelType {
  VIDEO = 'video',
  AUDIO = 'audio',
  IMAGE = 'image',
  SPEECH = 'speech',
  TEXT = 'text',
  TEXT_TO_IMAGE = 'text-to-image',
  TEXT_TO_VIDEO = 'text-to-video',
  IMAGE_TO_VIDEO = 'image-to-video',
  IMAGE_TO_IMAGE = 'image-to-image',
  AUDIO_TO_TEXT = 'audio-to-text',
  TEXT_TO_AUDIO = 'text-to-audio',
  TEXT_TO_SPEECH = 'text-to-speech',
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
