import { HydratedDocument, Types } from 'mongoose'

export enum SkillBinding {
  IMAGE = 'image',
  VIDEO = 'video',
  TEXT = 'text',
}

export enum SkillSource {
  SYSTEM = 'system',
  USER = 'user',
  FORKED = 'forked',
}

export enum SkillVisibility {
  PRIVATE = 'private',
  WORKSPACE = 'workspace',
  PUBLIC = 'public',
}

export enum SkillStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

export enum SkillCategoryStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum SkillVariableType {
  TEXT = 'text',
  NUMBER = 'number',
  SELECT = 'select',
  BOOLEAN = 'boolean',
}

export type SkillVariableValue = string | number | boolean

export interface ISkillVariable {
  key: string
  label: string
  description?: string
  type: SkillVariableType
  required: boolean
  defaultValue?: SkillVariableValue
  options?: string[]
}

export interface ISkillModelConfig {
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface ISkillCategory {
  _id: Types.ObjectId
  workspaceId: Types.ObjectId | null
  slug: string
  name: string
  description: string
  icon?: string
  sortOrder: number
  source: SkillSource
  status: SkillCategoryStatus
  createdBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export type SkillCategoryDocument = HydratedDocument<ISkillCategory>

export interface ISkill {
  _id: Types.ObjectId
  workspaceId: Types.ObjectId | null
  slug: string
  name: string
  description: string
  categoryId: Types.ObjectId
  binding: SkillBinding
  slot?: string
  icon?: string
  content: string
  variables: ISkillVariable[]
  outputSchema?: Record<string, unknown>
  toolBindings?: string[]
  modelConfig?: ISkillModelConfig
  source: SkillSource
  forkedFrom?: Types.ObjectId
  visibility: SkillVisibility
  status: SkillStatus
  version: number
  usageCount: number
  createdBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export type SkillDocument = HydratedDocument<ISkill>

export type CreateSkillCategoryInput = {
  workspaceId?: string | null
  slug: string
  name: string
  description?: string
  icon?: string
  sortOrder?: number
  source: SkillSource
  status?: SkillCategoryStatus
  createdBy?: string
}

export type UpdateSkillCategoryInput = {
  slug?: string
  name?: string
  description?: string
  icon?: string | null
  sortOrder?: number
  status?: SkillCategoryStatus
}

export type CreateSkillInput = {
  workspaceId?: string | null
  slug: string
  name: string
  description?: string
  categoryId: string
  binding: SkillBinding
  slot?: string
  icon?: string
  content: string
  variables?: ISkillVariable[]
  outputSchema?: Record<string, unknown>
  toolBindings?: string[]
  modelConfig?: ISkillModelConfig
  source: SkillSource
  forkedFrom?: string
  visibility?: SkillVisibility
  status?: SkillStatus
  version?: number
  usageCount?: number
  createdBy?: string
}

export type UpdateSkillInput = {
  slug?: string
  name?: string
  description?: string
  categoryId?: string
  binding?: SkillBinding
  slot?: string | null
  icon?: string | null
  content?: string
  variables?: ISkillVariable[]
  outputSchema?: Record<string, unknown> | null
  toolBindings?: string[] | null
  modelConfig?: ISkillModelConfig | null
  visibility?: SkillVisibility
  status?: SkillStatus
  version?: number
}

export type SystemCategorySyncInput = {
  slug: string
  name: string
  description: string
  icon?: string
  sortOrder?: number
}

export type SystemSkillSyncInput = {
  slug: string
  name: string
  description: string
  categorySlug: string
  binding: string
  slot?: string
  content: string
  icon?: string
  variables?: import('@socialista/types').SkillVariable[]
  outputSchema?: Record<string, unknown>
  toolBindings?: string[]
  modelConfig?: ISkillModelConfig
}
