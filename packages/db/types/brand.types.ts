import { HydratedDocument, Types } from 'mongoose'

export interface IBrand {
  _id: Types.ObjectId
  workspaceId: Types.ObjectId
  project?: Types.ObjectId
  name: string
  description?: string
  industry?: string
  website?: string
  logo?: string
  colors: string[]
  createdAt: Date
  updatedAt: Date
}

export type BrandDocument = HydratedDocument<IBrand>
