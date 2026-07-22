import { Types } from 'mongoose'
import { WorkspaceModel } from '../models/workspace.model.js'
import {
  BillingStatus,
  IWorkspace,
  PLAN_LIMITS,
  Plan,
  WorkspaceMemberRole,
  type WorkspaceBillingUpdate,
  type WorkspaceUsage,
} from '../types/workspace.types.js'
import { assertValidTimezone } from '../utils/timezone.js'

type UsageField = keyof WorkspaceUsage

const requireWorkspaceId = (workspaceId: string, label = 'Workspace ID') => {
  if (!workspaceId) {
    throw new Error(`${label} is required`)
  }
}

const normalizeSettings = (settings: IWorkspace['settings']): IWorkspace['settings'] => ({
  ...settings,
  timezone: assertValidTimezone(settings.timezone),
})


const getWorkspaceOrThrow = async (workspaceId: string) => {
  const workspace = await WorkspaceModel.findById(workspaceId).lean()
  if (!workspace) {
    throw new Error('Workspace not found')
  }
  return workspace
}

const defaultFreePlanDefaults = () => {
  const limits = PLAN_LIMITS[Plan.FREE]

  return {
    settings: { timezone: 'Europe/Sofia', language: 'en' },
    limits: {
      members: limits.members,
      storage: limits.storage,
      accounts: limits.accounts,
      posts: limits.posts,
    },
    usage: {
      storage: 0,
      accounts: 0,
      posts: 0,
    },
    billing: {
      plan: Plan.FREE,
      status: BillingStatus.ACTIVE,
      nextBillingDate: new Date(),
      nextBillingAmount: 0,
      aiCreditsBalance: 0,
    },
  }
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export const getWorkspaceById = async (id: string) => {
  return await WorkspaceModel.findById(id).lean()
}

export const getUserWorkspaces = async (userId: string) => {
  return await WorkspaceModel.find({ 'members.userId': new Types.ObjectId(userId) }).lean()
}

export const getWorkspaceByPolarCustomerId = async (customerId: string) => {
  return await WorkspaceModel.findOne({ 'billing.polarCustomerId': customerId }).lean()
}

export const getWorkspaceByPolarSubscriptionId = async (subscriptionId: string) => {
  return await WorkspaceModel.findOne({ 'billing.polarSubscriptionId': subscriptionId }).lean()
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

export const createWorkspace = async (workspace: Partial<IWorkspace>, userId: string) => {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const defaults = defaultFreePlanDefaults()
  const settings = normalizeSettings(workspace.settings ?? defaults.settings)

  return await WorkspaceModel.create({
    ...defaults,
    ...workspace,
    settings,
    limits: workspace.limits ?? defaults.limits,
    usage: workspace.usage ?? defaults.usage,
    billing: workspace.billing ?? defaults.billing,
    ownerId: new Types.ObjectId(userId),
    members: [
      {
        userId: new Types.ObjectId(userId),
        role: WorkspaceMemberRole.OWNER,
      },
    ],
  })
}

export const updateWorkspace = async (workspaceId: string, data: Partial<IWorkspace>) => {
  requireWorkspaceId(workspaceId)
  if (!data || Object.keys(data).length === 0) {
    throw new Error('Update data is required')
  }

  const updates = { ...data }
  if (updates.settings) {
    updates.settings = normalizeSettings(updates.settings)
  }

  return await WorkspaceModel.findByIdAndUpdate(workspaceId, { $set: updates }, { returnDocument: 'after' }).lean()
}

export const deleteWorkspace = async (workspaceId: string) => {
  return await WorkspaceModel.findByIdAndDelete(workspaceId).lean()
}

// ─── Members ─────────────────────────────────────────────────────────────────

export const addWorkspaceMember = async (workspaceId: string, userId: string, role: WorkspaceMemberRole) => {
  if (!workspaceId || !userId || !role) {
    throw new Error('Workspace ID, User ID and Role are required')
  }

  const workspace = await getWorkspaceOrThrow(workspaceId)

  if (workspace.members.some(member => member.userId.toString() === userId)) {
    throw new Error('User already a member of the workspace')
  }

  return await WorkspaceModel.findByIdAndUpdate(
    workspaceId,
    { $addToSet: { members: { userId: new Types.ObjectId(userId), role } } },
    { returnDocument: 'after' },
  ).lean()
}

export const removeWorkspaceMember = async (workspaceId: string, userId: string) => {
  if (!workspaceId || !userId) {
    throw new Error('Workspace ID and User ID are required')
  }

  const workspace = await getWorkspaceOrThrow(workspaceId)

  if (!workspace.members.some(member => member.userId.toString() === userId)) {
    throw new Error('User is not a member of the workspace')
  }

  return await WorkspaceModel.findByIdAndUpdate(
    workspaceId,
    { $pull: { members: { userId: new Types.ObjectId(userId) } } },
    { returnDocument: 'after' },
  ).lean()
}

export const updateWorkspaceMemberRole = async (workspaceId: string, userId: string, role: WorkspaceMemberRole) => {
  if (!workspaceId || !userId || !role) {
    throw new Error('Workspace ID, User ID and Role are required')
  }

  const workspace = await getWorkspaceOrThrow(workspaceId)

  if (!workspace.members.some(member => member.userId.toString() === userId)) {
    throw new Error('User is not a member of the workspace')
  }

  return await WorkspaceModel.findByIdAndUpdate(
    workspaceId,
    {
      $set: {
        members: workspace.members.map(member => (member.userId.toString() === userId ? { ...member, role } : member)),
      },
    },
    { returnDocument: 'after' },
  ).lean()
}

// ─── Usage ───────────────────────────────────────────────────────────────────

export const incrementWorkspaceUsage = async (workspaceId: string, field: UsageField, amount = 1) => {
  if (amount <= 0) {
    return await getWorkspaceById(workspaceId)
  }

  return await WorkspaceModel.findByIdAndUpdate(
    workspaceId,
    { $inc: { [`usage.${field}`]: amount } },
    { returnDocument: 'after' },
  ).lean()
}

export const decrementWorkspaceUsage = async (workspaceId: string, field: UsageField, amount = 1) => {
  if (amount <= 0) {
    return await getWorkspaceById(workspaceId)
  }

  return await WorkspaceModel.findByIdAndUpdate(
    workspaceId,
    [{ $set: { [`usage.${field}`]: { $max: [0, { $subtract: [`$usage.${field}`, amount] }] } } }],
    { returnDocument: 'after', updatePipeline: true },
  ).lean()
}

export const incrementWorkspaceStorageUsage = async (workspaceId: string, bytes: number) => {
  return await incrementWorkspaceUsage(workspaceId, 'storage', bytes)
}

export const decrementWorkspaceStorageUsage = async (workspaceId: string, bytes: number) => {
  return await decrementWorkspaceUsage(workspaceId, 'storage', bytes)
}

export const incrementPostsUsage = async (workspaceId: string, amount = 1) => {
  return await incrementWorkspaceUsage(workspaceId, 'posts', amount)
}

export const decrementPostsUsage = async (workspaceId: string, amount = 1) => {
  return await decrementWorkspaceUsage(workspaceId, 'posts', amount)
}

export const incrementAccountsUsage = async (workspaceId: string, amount = 1) => {
  return await incrementWorkspaceUsage(workspaceId, 'accounts', amount)
}

export const decrementAccountsUsage = async (workspaceId: string, amount = 1) => {
  return await decrementWorkspaceUsage(workspaceId, 'accounts', amount)
}

// ─── Billing & credits ───────────────────────────────────────────────────────

export const updateWorkspaceBilling = async (workspaceId: string, billing: WorkspaceBillingUpdate) => {
  const setFields: Record<string, unknown> = {}
  const unsetFields: Record<string, ''> = {}

  for (const [key, value] of Object.entries(billing)) {
    if (value === null) {
      unsetFields[`billing.${key}`] = ''
      continue
    }

    if (value !== undefined) {
      setFields[`billing.${key}`] = value
    }
  }

  if (Object.keys(setFields).length === 0 && Object.keys(unsetFields).length === 0) {
    return await getWorkspaceById(workspaceId)
  }

  return await WorkspaceModel.findByIdAndUpdate(
    workspaceId,
    {
      ...(Object.keys(setFields).length > 0 ? { $set: setFields } : {}),
      ...(Object.keys(unsetFields).length > 0 ? { $unset: unsetFields } : {}),
    },
    { returnDocument: 'after' },
  ).lean()
}

export const provisionPlan = async (workspaceId: string, plan: Plan) => {
  const limits = PLAN_LIMITS[plan]

  return await WorkspaceModel.findByIdAndUpdate(
    workspaceId,
    {
      $set: {
        limits: {
          members: limits.members,
          posts: limits.posts,
          storage: limits.storage,
          accounts: limits.accounts,
        },
        'billing.plan': plan,
        'billing.aiCreditsBalance': limits.aiCredits,
      },
    },
    { returnDocument: 'after' },
  ).lean()
}

export const increaseAiCreditsBalance = async (workspaceId: string, amount: number) => {
  if (amount <= 0) {
    return await getWorkspaceOrThrow(workspaceId)
  }

  return await WorkspaceModel.findByIdAndUpdate(
    workspaceId,
    { $inc: { 'billing.aiCreditsBalance': amount } },
    { returnDocument: 'after' },
  ).lean()
}

export const deductAiCredits = async (workspaceId: string, amount: number) => {
  if (amount <= 0) {
    return await getWorkspaceById(workspaceId)
  }

  return await WorkspaceModel.findByIdAndUpdate(
    workspaceId,
    [
      {
        $set: {
          'billing.aiCreditsBalance': {
            $max: [0, { $subtract: ['$billing.aiCreditsBalance', amount] }],
          },
        },
      },
    ],
    { returnDocument: 'after', updatePipeline: true },
  ).lean()
}

export const resetBillingPeriodUsage = async (workspaceId: string) => {
  const workspace = await getWorkspaceOrThrow(workspaceId)
  const limits = PLAN_LIMITS[workspace.billing.plan]

  return await WorkspaceModel.findByIdAndUpdate(
    workspaceId,
    {
      $set: {
        'usage.posts': 0,
        'billing.aiCreditsBalance': limits.aiCredits,
      },
    },
    { returnDocument: 'after' },
  ).lean()
}

export const getWorkspaceBalance = async (workspaceId: string) => {
  const workspace = await WorkspaceModel.findById(workspaceId).select('billing.aiCreditsBalance').lean()
  return workspace?.billing.aiCreditsBalance ?? 0
}

export const getWorkspacePolarCustomerId = async (workspaceId: string) => {
  const workspace = await WorkspaceModel.findById(workspaceId).select('billing.polarCustomerId').lean()
  if (!workspace) {
    throw new Error('Workspace not found')
  }
  return workspace.billing.polarCustomerId ?? null
}
