import type { HydratedDocument, Types } from 'mongoose'

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

export type PlanLimits = {
  members: number
  posts: number
  storage: number
  accounts: number
  aiCredits: number
  price: number
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  [Plan.FREE]: { members: 1, posts: 30, storage: 500, accounts: 3, aiCredits: 0, price: 0 },
  [Plan.PRO]: { members: 5, posts: 400, storage: 5000, accounts: 10, aiCredits: 8, price: 25 },
  [Plan.ENTERPRISE]: { members: 50, posts: 2000, storage: 10000, accounts: 50, aiCredits: 50, price: 0 },
}

export type WorkspaceMember = {
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
  aiCreditsBalance: number
  polarCustomerId?: string
  polarSubscriptionId?: string
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
}

export type WorkspaceBillingUpdate = {
  [K in keyof WorkspaceBilling]?: WorkspaceBilling[K] | null
}

export interface IWorkspace {
  _id: string
  name: string
  ownerId: Types.ObjectId
  description?: string
  logo?: string
  settings: WorkspaceSettings
  avatar?: string
  status: WorkspaceStatus
  members: WorkspaceMember[]
  limits: WorkspaceLimits
  usage: WorkspaceUsage
  billing: WorkspaceBilling
  createdAt: Date
  updatedAt: Date
}

export type WorkspaceDocument = HydratedDocument<IWorkspace>
