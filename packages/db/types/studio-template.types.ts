import type {
  StudioTemplateKind,
  StudioTemplatePayload,
} from '@socialista/types'
import type { HydratedDocument, Types } from 'mongoose'

export interface IStudioTemplateCategory {
  _id: Types.ObjectId
  kind: StudioTemplateKind
  name: string
  slug: string
  templatesCount: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IStudioTemplate {
  _id: Types.ObjectId
  kind: StudioTemplateKind
  categories: string[]
  previewImageUrl: string
  sourceImageUrl: string
  payload: StudioTemplatePayload
  name?: string
  description?: string
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type StudioTemplateCategoryDocument = HydratedDocument<IStudioTemplateCategory>
export type StudioTemplateDocument = HydratedDocument<IStudioTemplate>

export type CreateStudioTemplateInput = {
  kind: StudioTemplateKind
  categories: string[]
  previewImageUrl: string
  sourceImageUrl: string
  payload: StudioTemplatePayload
  name?: string
  description?: string
  active?: boolean
}
