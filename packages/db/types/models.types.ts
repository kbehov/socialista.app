import { HydratedDocument, Types } from 'mongoose'
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

export interface IModel {
  _id: Types.ObjectId
  chef: string
  value: string
  name: string
  cost: number // cost per unit of costUnit
  costUnit: CostUnit
  modelType: ModelType
  contextSupports: ContextSupport[]
  usageCount: number
  modelProvider: string
  createdAt: Date
  updatedAt: Date
}

export type ModelDocument = HydratedDocument<IModel>
