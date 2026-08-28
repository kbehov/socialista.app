import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import { ContextSupport, CostUnit, IModel, ModelType } from '../types/models.types.js'
import './ai-company.model.js'

const modelSchema = new Schema<IModel>(
  {
    value: { type: String, required: true },
    name: { type: String, required: true },
    cost: { type: Number, required: true },
    usageCount: { type: Number, default: 0 },
    costUnit: { type: String, required: true, enum: enumValues(CostUnit) },
    modelType: { type: String, required: true, enum: enumValues(ModelType) },
    contextSupports: {
      type: [{ type: String, enum: enumValues(ContextSupport) }],
      required: true,
      default: [ContextSupport.TEXT],
    },
    modelProvider: { type: String, required: true },
    company: { type: Schema.Types.ObjectId, ref: 'AiCompany', required: true },
  },
  { timestamps: true },
)

modelSchema.index({ contextSupports: 1 })
modelSchema.index({ modelType: 1, contextSupports: 1 })
modelSchema.index({ company: 1 })

export const ModelModel = model<IModel>('Model', modelSchema)
