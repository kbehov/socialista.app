import { HydratedDocument, Types } from 'mongoose'
import type { IAiCompany } from './ai-company.types.js'

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

export type PopulatedAiCompany = Pick<IAiCompany, '_id' | 'name' | 'logo'>

export interface IModel {
  _id: Types.ObjectId
  value: string
  name: string
  cost: number // cost per unit of costUnit
  costUnit: CostUnit
  modelType: ModelType
  contextSupports: ContextSupport[]
  usageCount: number
  modelProvider: string
  /** AI lab/company that owns the model. Populated as `{ name, logo }` on reads. */
  company?: Types.ObjectId | PopulatedAiCompany
  createdAt: Date
  updatedAt: Date
}

export type ModelDocument = HydratedDocument<IModel>
