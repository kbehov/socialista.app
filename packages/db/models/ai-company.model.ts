import { model, Schema } from 'mongoose'
import type { IAiCompany } from '../types/ai-company.types.js'

const aiCompanySchema = new Schema<IAiCompany>(
  {
    name: { type: String, required: true, trim: true },
    logo: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
  },
  { timestamps: true },
)

aiCompanySchema.index({ name: 1 }, { unique: true })

export const AiCompanyModel = model<IAiCompany>('AiCompany', aiCompanySchema)
