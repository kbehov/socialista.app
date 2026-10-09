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

/**
 * Fallback limits when a Polar product omits metadata.
 * Paid products (Creator, Pro, Studio, …) provision from their own metadata and are stored as `Plan.PRO`.
 * `price` is the catalog amount in dollars. Live charges are stored in cents on `WorkspaceBilling.nextBillingAmount`.
 */
export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  [Plan.FREE]: { members: 1, posts: 50, storage: 100, accounts: 3, aiCredits: 30, price: 0 },
  [Plan.PRO]: { members: 3, posts: 500, storage: 500, accounts: 30, aiCredits: 1500, price: 25 },
  [Plan.ENTERPRISE]: { members: 50, posts: 2000, storage: 10000, accounts: 50, aiCredits: 5000, price: 0 },
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

export const ADDITIONAL_WORKSPACE_LIMITS: WorkspaceLimits = {
  members: 1,
  posts: 0,
  storage: 0,
  accounts: 0,
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
  /** Next charge in cents (Polar's smallest currency unit). */
  nextBillingAmount: number
  aiCreditsBalance: number
  /** Credits included each billing period for the current product. */
  aiCreditsAllotment?: number
  polarCustomerId?: string
  polarSubscriptionId?: string
  /** Polar product currently applied to this workspace. */
  polarProductId?: string
  /** Display name of the Polar product currently applied (for example Creator or Studio). */
  polarProductName?: string
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
