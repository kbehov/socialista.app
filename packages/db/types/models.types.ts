import { HydratedDocument, Types } from 'mongoose'
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

export interface IModel {
  _id: Types.ObjectId
  name: string
  cost: number // cost per unit of costUnit
  costUnit: CostUnit
  modelType: ModelType
  modelProvider: string
  createdAt: Date
  updatedAt: Date
}

export type ModelDocument = HydratedDocument<IModel>
