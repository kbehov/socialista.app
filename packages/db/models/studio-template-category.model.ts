import { STUDIO_TEMPLATE_KIND_VALUES } from '@socialista/types'
import { model, Schema } from 'mongoose'
import type { IStudioTemplateCategory } from '../types/studio-template.types.js'

const studioTemplateCategorySchema = new Schema<IStudioTemplateCategory>(
  {
    kind: { type: String, enum: STUDIO_TEMPLATE_KIND_VALUES, required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    templatesCount: { type: Number, required: true, default: 0 },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  { timestamps: true },
)

studioTemplateCategorySchema.index({ kind: 1, slug: 1 }, { unique: true })
studioTemplateCategorySchema.index({ kind: 1, name: 1 }, { unique: true })

export const StudioTemplateCategoryModel = model<IStudioTemplateCategory>(
  'StudioTemplateCategory',
  studioTemplateCategorySchema,
)
