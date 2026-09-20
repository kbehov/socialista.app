import { STUDIO_TEMPLATE_KIND_VALUES } from '@socialista/types'
import { model, Schema } from 'mongoose'
import type { IStudioTemplate } from '../types/studio-template.types.js'

const studioTemplateSchema = new Schema<IStudioTemplate>(
  {
    kind: { type: String, enum: STUDIO_TEMPLATE_KIND_VALUES, required: true, index: true },
    categories: { type: [String], required: true, default: [] },
    previewImageUrl: { type: String, required: true },
    sourceImageUrl: { type: String, required: true, unique: true },
    // Validated at the import boundary; shape depends on `kind`. Prompt is optional.
    payload: { type: Schema.Types.Mixed, required: true, default: {} },
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    active: { type: Boolean, required: true, default: true, index: true },
  },
  { timestamps: true },
)

studioTemplateSchema.index({ kind: 1, active: 1, categories: 1 })
studioTemplateSchema.index({ kind: 1, active: 1, createdAt: -1 })

export const StudioTemplateModel = model<IStudioTemplate>('StudioTemplate', studioTemplateSchema)
