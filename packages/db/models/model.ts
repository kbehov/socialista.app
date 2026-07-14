import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import { CostUnit, IModel, ModelType } from '../types/models.types.js'

const modelSchema = new Schema<IModel>(
  {
    chef: { type: String, required: true },
    value: { type: String, required: true },
    name: { type: String, required: true },
    cost: { type: Number, required: true },
    usageCount: { type: Number, default: 0 },
    costUnit: { type: String, required: true, enum: enumValues(CostUnit) },
    modelType: { type: String, required: true, enum: enumValues(ModelType) },
    modelProvider: { type: String, required: true },
  },
  { timestamps: true },
)

export const ModelModel = model<IModel>('Model', modelSchema)
