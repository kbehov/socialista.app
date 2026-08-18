import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import {
  SkillCategoryStatus,
  SkillSource,
  type ISkillCategory,
} from '../types/skill.types.js'

const skillCategorySchema = new Schema<ISkillCategory>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null,
      index: true,
    },
    slug: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, default: '' },
    icon: { type: String },
    sortOrder: { type: Number, required: true, default: 0 },
    source: {
      type: String,
      enum: enumValues(SkillSource),
      required: true,
      default: SkillSource.USER,
      index: true,
    },
    status: {
      type: String,
      enum: enumValues(SkillCategoryStatus),
      required: true,
      default: SkillCategoryStatus.ACTIVE,
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

skillCategorySchema.index({ workspaceId: 1, slug: 1 }, { unique: true })
skillCategorySchema.index({ workspaceId: 1, status: 1, sortOrder: 1 })

export const SkillCategoryModel = model<ISkillCategory>('SkillCategory', skillCategorySchema)
