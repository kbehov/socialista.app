import { model, Schema } from 'mongoose'
import type { IBrand } from '../types/brand.types.js'

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    industry: { type: String, trim: true },
    website: { type: String, trim: true },
    logo: { type: String, trim: true },
    colors: { type: [String], default: [] },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  },
  {
    timestamps: true,
  },
)

brandSchema.index({ workspaceId: 1, createdAt: -1 })
brandSchema.index({ project: 1, createdAt: -1 })

export const BrandModel = model<IBrand>('Brand', brandSchema)
