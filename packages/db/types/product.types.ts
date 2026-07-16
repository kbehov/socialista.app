import { HydratedDocument, Types } from 'mongoose'
export interface Iproduct {
  _id: Types.ObjectId
  workspaceId: Types.ObjectId
  name: string
  images: string[]
  description: string
  url: string
  price: number
  createdAt: Date
  updatedAt: Date
}

export type ProductDocument = HydratedDocument<Iproduct>
