import { HydratedDocument, Types } from 'mongoose'
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
