import { HydratedDocument, Types } from 'mongoose'

export enum ProjectStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export interface IProject {
  _id: Types.ObjectId
  workspace: Types.ObjectId
  name: string
  description?: string
  color?: string
  icon?: string
  timezone: string
  status: ProjectStatus
  isDefault: boolean
  createdBy: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

export type ProjectDocument = HydratedDocument<IProject>

export type CreateProjectInput = {
  workspace: string
  name: string
  createdBy: string
  timezone: string
  description?: string
  color?: string
  icon?: string
  status?: ProjectStatus
  isDefault?: boolean
}

export type UpdateProjectInput = {
  name?: string
  description?: string | null
  color?: string | null
  icon?: string | null
  timezone?: string
  status?: ProjectStatus
}
