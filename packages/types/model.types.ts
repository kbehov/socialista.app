import type { MetaResponse } from './common.types.js'
export type Model = {
  _id: string
  name: string
  cost: number
  costUnit: string
  modelType: string
  modelProvider: string
  createdAt: Date
  updatedAt: Date
}

export type GetModelsResponse = {
  models: Model[]
  meta: MetaResponse
}
