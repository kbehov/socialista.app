import { model, Schema } from 'mongoose'
import type { Iproduct } from '../types/product.types.js'

const productSchema = new Schema<Iproduct>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    url: { type: String, required: true },
    images: { type: [String], required: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', index: true },
  },
  {
    timestamps: true,
  },
)

productSchema.index({ workspaceId: 1, createdAt: -1 })
productSchema.index({ project: 1, createdAt: -1 })

export const ProductModel = model<Iproduct>('Product', productSchema)
