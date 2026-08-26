import { model, Schema } from 'mongoose'
import type { IStaticAdTemplateCategory } from '../types/static-ad-template.types.js'

const staticAdTemplateCategorySchema = new Schema<IStaticAdTemplateCategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    templatesCount: { type: Number, required: true, default: 0 },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  { timestamps: true },
)

export const StaticAdTemplateCategoryModel = model<IStaticAdTemplateCategory>(
  'StaticAdTemplateCategory',
  staticAdTemplateCategorySchema,
)
