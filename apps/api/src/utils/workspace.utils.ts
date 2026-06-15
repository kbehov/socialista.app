import { parseParamId } from '@/utils/common.utils.js'
import { HttpError } from '@/utils/http-response.js'
import { serializeUser } from '@/utils/user.utils.js'
import {
  BillingStatus,
  getUserById,
  getWorkspaceById,
  isValidId,
  Plan,
  WorkspaceMemberRole,
  type IWorkspace,
  type UserDocument,
  type WorkspaceMember,
} from '@socialista/db'

export const defaultWorkspaceBilling = () => ({
  plan: Plan.FREE,
  status: BillingStatus.ACTIVE,
  nextBillingDate: new Date(),
  nextBillingAmount: 0,
})

export const defaultWorkspaceSettings = () => ({
  timezone: 'UTC',
})

export const serializeWorkspace = (workspace: IWorkspace) => ({
  id: workspace._id.toString(),
  name: workspace.name,
  description: workspace.description,
  avatar: workspace.avatar,
  status: workspace.status,
  ownerId: workspace.ownerId.toString(),
  settings: workspace.settings,
  limits: workspace.limits,
  usage: workspace.usage,
  billing: workspace.billing,
  createdAt: workspace.createdAt,
  updatedAt: workspace.updatedAt,
})

export const serializeWorkspaceMember = (member: WorkspaceMember, user?: UserDocument) => ({
  userId: member.userId.toString(),
  role: member.role,
  user: user ? serializeUser(user) : undefined,
})

export const isValidWorkspaceMemberRole = (role: unknown): role is WorkspaceMemberRole =>
  typeof role === 'string' && Object.values(WorkspaceMemberRole).includes(role as WorkspaceMemberRole)

export const getMemberRole = (workspace: IWorkspace, userId: string): WorkspaceMemberRole | undefined =>
  workspace.members.find(member => member.userId.toString() === userId)?.role

export const assertWorkspaceMember = (workspace: IWorkspace, userId: string): void => {
  if (!getMemberRole(workspace, userId)) {
    throw new HttpError(403, 'Forbidden')
  }
}

export const assertWorkspaceAdmin = (workspace: IWorkspace, userId: string): void => {
  const role = getMemberRole(workspace, userId)
  if (role !== WorkspaceMemberRole.OWNER && role !== WorkspaceMemberRole.ADMIN) {
    throw new HttpError(403, 'Forbidden')
  }
}

export const assertWorkspaceOwner = (workspace: IWorkspace, userId: string): void => {
  if (getMemberRole(workspace, userId) !== WorkspaceMemberRole.OWNER) {
    throw new HttpError(403, 'Forbidden')
  }
}

export const getWorkspaceOrThrow = async (id: string) => {
  if (!isValidId(id)) {
    throw new HttpError(400, 'Invalid workspace ID')
  }
  const workspace = await getWorkspaceById(id)
  if (!workspace) {
    throw new HttpError(404, 'Workspace not found')
  }
  return workspace
}

export const getWorkspaceAsMember = async (id: string, userId: string) => {
  const workspace = await getWorkspaceOrThrow(id)
  assertWorkspaceMember(workspace, userId)
  return workspace
}

export const getWorkspaceAsAdmin = async (id: string, userId: string) => {
  const workspace = await getWorkspaceOrThrow(id)
  assertWorkspaceAdmin(workspace, userId)
  return workspace
}

export const getWorkspaceAsOwner = async (id: string, userId: string) => {
  const workspace = await getWorkspaceOrThrow(id)
  assertWorkspaceOwner(workspace, userId)
  return workspace
}

export const parseCreateWorkspaceInput = (body: Record<string, unknown>) => {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) {
    throw new HttpError(400, 'Workspace name is required')
  }

  return {
    name,
    description: body.description as string | undefined,
    avatar: body.avatar as string | undefined,
    settings: (body.settings as IWorkspace['settings']) ?? defaultWorkspaceSettings(),
  }
}

export const parseAddMemberInput = (body: Record<string, unknown>) => {
  const memberId = parseParamId(typeof body.userId === 'string' ? body.userId : undefined, 'user ID')
  if (!isValidWorkspaceMemberRole(body.role)) {
    throw new HttpError(400, 'Valid role is required')
  }
  return { memberId, role: body.role }
}

export const parseMemberRoleUpdate = (body: Record<string, unknown>): WorkspaceMemberRole => {
  if (!isValidWorkspaceMemberRole(body.role)) {
    throw new HttpError(400, 'Valid role is required')
  }
  return body.role
}

export const assertModifiableMember = (workspace: IWorkspace, memberId: string): void => {
  const role = getMemberRole(workspace, memberId)
  if (!role) {
    throw new HttpError(404, 'Member not found')
  }
  if (role === WorkspaceMemberRole.OWNER) {
    throw new HttpError(400, 'Cannot modify workspace owner')
  }
}

export const pickWorkspaceUpdates = (body: Record<string, unknown>): Partial<IWorkspace> => {
  const updates: Partial<IWorkspace> = {}

  if (typeof body.name === 'string' && body.name) {
    updates.name = body.name
  }
  if (body.description !== undefined) {
    updates.description = body.description as string | undefined
  }
  if (body.avatar !== undefined) {
    updates.avatar = body.avatar as string | undefined
  }
  if (body.settings) {
    updates.settings = body.settings as IWorkspace['settings']
  }

  return updates
}

export const loadWorkspaceMembers = async (workspace: IWorkspace) => {
  return Promise.all(
    workspace.members.map(async member => {
      const user = await getUserById(member.userId.toString())
      return serializeWorkspaceMember(member, user ?? undefined)
    }),
  )
}
