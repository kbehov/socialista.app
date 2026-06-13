import type { HydratedDocument } from 'mongoose'

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

/** OAuth provider linked to the user for sign-in (e.g. Google, GitHub). */
export type OAuthAccount = {
  provider: string
  providerAccountId: string
}

export interface IUser {
  _id: string
  email: string
  name: string
  avatar?: string
  password?: string
  status: UserStatus
  lastLoginAt?: Date
  role: UserRole
  oauthAccounts: OAuthAccount[]
  createdAt: Date
  updatedAt: Date
}

export type UserDocument = HydratedDocument<IUser>
