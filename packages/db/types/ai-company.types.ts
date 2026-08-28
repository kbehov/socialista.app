import { HydratedDocument, Types } from 'mongoose'

export interface IAiCompany {
  _id: Types.ObjectId
  name: string
  logo: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

export type AiCompanyDocument = HydratedDocument<IAiCompany>

export type CreateAiCompanyInput = {
  name: string
  logo: string
}

export type UpdateAiCompanyInput = {
  name?: string
  logo?: string
}
