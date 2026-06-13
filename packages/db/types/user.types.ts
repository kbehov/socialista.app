import type { HydratedDocument } from 'mongoose'

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface IUser {
  _id: string
  email: string
  name: string
  avatar?: string
  password?: string
  status: UserStatus
  lastLoginAt: Date
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type UserDocument = HydratedDocument<IUser>
