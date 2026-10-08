import type { AspectRatio, StaticAdTemplateFormat } from '@socialista/types'
import { HydratedDocument, Types } from 'mongoose'

export interface IStaticAdTemplatePaletteSwatch {
  hex: string
  role: string
}

export interface IStaticAdTemplateBlueprint {
  format: StaticAdTemplateFormat
  layout: string
  typeHierarchy: string
  palette: IStaticAdTemplatePaletteSwatch[]
  hookStyle: string
  sceneJob: string
  aspectRatioHint?: AspectRatio
  analyzedAt: Date
  version: number
}

export interface IStaticAdTemplateCategory {
  _id: Types.ObjectId
  name: string
  slug: string
  templatesCount: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IStaticAdTemplate {
  _id: Types.ObjectId
  imageUrl: string
  sourceImageUrl: string
  categories: string[]
  name?: string
  blueprint?: IStaticAdTemplateBlueprint
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export type StaticAdTemplateCategoryDocument = HydratedDocument<IStaticAdTemplateCategory>
export type StaticAdTemplateDocument = HydratedDocument<IStaticAdTemplate>

export type CreateStaticAdTemplateInput = {
  imageUrl: string
  sourceImageUrl: string
  categories: string[]
  name?: string
  active?: boolean
}
