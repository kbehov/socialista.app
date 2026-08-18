import { model, Schema } from 'mongoose'
import { SKILL_SLOT_VALUES } from '@socialista/types'
import { enumValues } from '../lib/schema.js'
import {
  SkillBinding,
  SkillSource,
  SkillStatus,
  SkillVariableType,
  SkillVisibility,
  type ISkill,
} from '../types/skill.types.js'

const skillVariableSchema = new Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: enumValues(SkillVariableType),
      required: true,
      default: SkillVariableType.TEXT,
    },
    required: { type: Boolean, required: true, default: false },
    defaultValue: { type: Schema.Types.Mixed },
    options: { type: [String] },
  },
  { _id: false },
)

const skillModelConfigSchema = new Schema(
  {
    model: { type: String },
    temperature: { type: Number },
    maxTokens: { type: Number },
  },
  { _id: false },
)

const skillSchema = new Schema<ISkill>(
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'SkillCategory',
      required: true,
      index: true,
    },
    binding: {
      type: String,
      enum: enumValues(SkillBinding),
      required: true,
      index: true,
    },
    slot: {
      type: String,
      enum: SKILL_SLOT_VALUES,
    },
    icon: { type: String },
    content: { type: String, required: true, default: '' },
    variables: { type: [skillVariableSchema], required: true, default: [] },
    outputSchema: { type: Schema.Types.Mixed },
    toolBindings: { type: [String] },
    modelConfig: { type: skillModelConfigSchema },
    source: {
      type: String,
      enum: enumValues(SkillSource),
      required: true,
      default: SkillSource.USER,
      index: true,
    },
    forkedFrom: { type: Schema.Types.ObjectId, ref: 'Skill' },
    visibility: {
      type: String,
      enum: enumValues(SkillVisibility),
      required: true,
      default: SkillVisibility.WORKSPACE,
    },
    status: {
      type: String,
      enum: enumValues(SkillStatus),
      required: true,
      default: SkillStatus.DRAFT,
      index: true,
    },
    version: { type: Number, required: true, default: 1 },
    usageCount: { type: Number, required: true, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

skillSchema.index({ workspaceId: 1, slug: 1 }, { unique: true })
skillSchema.index({ workspaceId: 1, categoryId: 1, status: 1 })
skillSchema.index({ workspaceId: 1, binding: 1, status: 1 })
skillSchema.index({ slot: 1, workspaceId: 1 })
skillSchema.index({ source: 1, status: 1 })

export const SkillModel = model<ISkill>('Skill', skillSchema)
