import type { HydratedDocument, Types } from 'mongoose'
// Enum for workspace
export enum WorkspaceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum WorkspaceMemberRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}
export enum Plan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}
export enum BillingStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}
export type WorkspaceMembers = {
  userId: Types.ObjectId
  role: WorkspaceMemberRole
}

export type WorkspaceSettings = {
  timezone: string
  language?: string
}

export type WorkspaceLimits = {
  members: number
  storage: number
  accounts: number
  posts: number
}

export type WorkspaceUsage = {
  storage: number
  accounts: number
  posts: number
}

export type WorkspaceBilling = {
  plan: Plan
  status: BillingStatus
  nextBillingDate: Date
  nextBillingAmount: number
}

export interface IWorkspace {
  _id: string
  name: string
  ownerId: Types.ObjectId
  description?: string
  settings: WorkspaceSettings
  avatar?: string
  status: WorkspaceStatus
  members: WorkspaceMembers[]
  limits: WorkspaceLimits
  usage: WorkspaceUsage
  billing: WorkspaceBilling
  createdAt: Date
  updatedAt: Date
}

export type WorkspaceDocument = HydratedDocument<IWorkspace>
