import { model, Schema } from 'mongoose'
import type { IStaticAdTemplate } from '../types/static-ad-template.types.js'

const staticAdTemplateSchema = new Schema<IStaticAdTemplate>(
  {
    imageUrl: { type: String, required: true },
    sourceImageUrl: { type: String, required: true, unique: true },
    categories: { type: [String], required: true, default: [] },
    name: { type: String, trim: true },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  { timestamps: true },
)

staticAdTemplateSchema.index({ active: 1, categories: 1 })
staticAdTemplateSchema.index({ active: 1, createdAt: -1 })

export const StaticAdTemplateModel = model<IStaticAdTemplate>('StaticAdTemplate', staticAdTemplateSchema)
