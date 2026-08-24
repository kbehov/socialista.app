import { HydratedDocument, Types } from 'mongoose'
import type { PromptKey } from '@socialista/types'

export interface ISkill {
  _id: Types.ObjectId
  workspaceId: Types.ObjectId
  slug: string
  name: string
  description: string
  icon?: string
  target: PromptKey
  content: string
  usageCount: number
  createdBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export type SkillDocument = HydratedDocument<ISkill>

export type CreateSkillInput = {
  workspaceId: string
  slug: string
  name: string
  description?: string
  icon?: string
  target: PromptKey
  content: string
  createdBy?: string
}

export type UpdateSkillInput = {
  slug?: string
  name?: string
  description?: string
  icon?: string | null
  target?: PromptKey
  content?: string
}
