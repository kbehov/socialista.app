import { model, Schema } from 'mongoose'
import { PROMPT_KEY_VALUES } from '@socialista/types'
import type { ISkill } from '../types/skill.types.js'

const skillSchema = new Schema<ISkill>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    slug: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, default: '' },
    icon: { type: String },
    target: { type: String, enum: PROMPT_KEY_VALUES, required: true },
    content: { type: String, required: true },
    usageCount: { type: Number, required: true, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

skillSchema.index({ workspaceId: 1, slug: 1 }, { unique: true })
skillSchema.index({ workspaceId: 1, target: 1 })

export const SkillModel = model<ISkill>('Skill', skillSchema)
