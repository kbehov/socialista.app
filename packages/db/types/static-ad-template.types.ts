import { HydratedDocument, Types } from 'mongoose'

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
