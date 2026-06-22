import { HydratedDocument, Types } from 'mongoose'

export interface IImage {
  _id: Types.ObjectId
  url: string
  width: number
  height: number
  key: string
  size?: number
  workspace?: Types.ObjectId
  collection?: Types.ObjectId
  uploadedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export type ImageDocument = HydratedDocument<IImage>

export interface IImageCollection {
  _id: Types.ObjectId
  name: string
  workspace?: Types.ObjectId
  isPublic: boolean
  description?: string
  createdBy: Types.ObjectId
  imagesCount: number
  createdAt: Date
  updatedAt: Date
}

export type ImageCollectionDocument = HydratedDocument<IImageCollection>
