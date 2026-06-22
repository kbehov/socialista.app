import { Types } from 'mongoose'

export interface Avatar {
  _id: Types.ObjectId
  workspace: Types.ObjectId
  user: Types.ObjectId
  image: string
  createdAt: Date
  updatedAt: Date
}
