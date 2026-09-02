import { parseParamId } from '@/utils/common.utils.js'
import { HttpError } from '@/utils/http-response.js'
import { serializeUser } from '@/utils/user.utils.js'

import {
  ADDITIONAL_WORKSPACE_LIMITS,
  BillingStatus,
  DEFAULT_TIMEZONE,
  PLAN_LIMITS,
  Plan,
  WorkspaceMemberRole,
  assertValidTimezone,
  getDefaultWorkspaceProject,
  getProjectById,
  getUserById,
  getWorkspaceById,
  isValidId,
  type IProject,
  type IWorkspace,
  type UserDocument,
  type WorkspaceMember,
} from '@socialista/db'

export const defaultWorkspaceBilling = () => ({
  plan: Plan.FREE,
  status: BillingStatus.ACTIVE,
  nextBillingDate: new Date(),
  nextBillingAmount: 0,
  aiCreditsBalance: 0,
})

export const defaultWorkspaceSettings = () => {
  const limits = PLAN_LIMITS[Plan.FREE]

  return {
    settings: { timezone: DEFAULT_TIMEZONE, language: 'en' },
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
  }
}

export const additionalWorkspaceLimits = (): IWorkspace['limits'] => ({ ...ADDITIONAL_WORKSPACE_LIMITS })

export const resolveCreateWorkspaceLimits = (ownedWorkspaceCount: number): IWorkspace['limits'] =>
  ownedWorkspaceCount > 0 ? additionalWorkspaceLimits() : defaultWorkspaceSettings().limits

/** Ensure workspace settings carry a valid IANA timezone. */
export const normalizeWorkspaceSettings = (
  settings: IWorkspace['settings'],
): IWorkspace['settings'] => ({
  ...settings,
  timezone: assertValidTimezone(settings.timezone),
})

const BYTES_PER_MB = 1024 * 1024

const buildUsageQuota = (used: number, limit: number) => {
  const safeUsed = Math.max(0, used)
  const safeLimit = Math.max(0, limit)
  const remaining = Math.max(0, safeLimit - safeUsed)
  const percentUsed = safeLimit > 0 ? Math.min(100, (safeUsed / safeLimit) * 100) : 100

  return { used: safeUsed, limit: safeLimit, remaining, percentUsed }
}

export const buildWorkspaceUsageSummary = (workspace: IWorkspace) => ({
  storage: buildUsageQuota(workspace.usage.storage, workspace.limits.storage * BYTES_PER_MB),
  posts: buildUsageQuota(workspace.usage.posts, workspace.limits.posts),
  accounts: buildUsageQuota(workspace.usage.accounts, workspace.limits.accounts),
  members: buildUsageQuota(workspace.members.length, workspace.limits.members),
})

export const buildWorkspaceBalance = (workspace: IWorkspace) => ({
  aiCreditsBalance: workspace.billing.aiCreditsBalance,
  plan: workspace.billing.plan,
  status: workspace.billing.status,
  usage: buildWorkspaceUsageSummary(workspace),
})

export const serializeWorkspace = (workspace: IWorkspace) => {
  const id = workspace._id.toString()

  return {
    id,
    _id: id,
    name: workspace.name,
    description: workspace.description,
    logo: workspace.logo,
    avatar: workspace.avatar,
    status: workspace.status,
    ownerId: workspace.ownerId.toString(),
    settings: workspace.settings,
    members: workspace.members.map(member => ({
      id: member.userId.toString(),
      role: member.role,
    })),
    limits: workspace.limits,
    usage: workspace.usage,
    billing: workspace.billing,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  }
}

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

export const assertWorkspaceStorageAvailable = (workspace: IWorkspace, fileSizeBytes: number): void => {
  const limitBytes = workspace.limits.storage * BYTES_PER_MB
  if (workspace.usage.storage + fileSizeBytes > limitBytes) {
    throw new HttpError(403, 'Workspace storage is full')
  }
}

export const assertMemberLimit = (workspace: IWorkspace): void => {
  if (workspace.members.length >= workspace.limits.members) {
    throw new HttpError(403, 'Workspace member limit reached')
  }
}

export const assertAccountsLimit = (workspace: IWorkspace): void => {
  if (workspace.usage.accounts >= workspace.limits.accounts) {
    throw new HttpError(403, 'Connected account limit reached')
  }
}

export const assertPostsLimit = (workspace: IWorkspace): void => {
  if (workspace.usage.posts >= workspace.limits.posts) {
    throw new HttpError(403, 'Workspace post limit reached')
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

export const getProjectOrThrow = async (id: string) => {
  if (!isValidId(id)) {
    throw new HttpError(400, 'Invalid project ID')
  }
  const project = await getProjectById(id)
  if (!project) {
    throw new HttpError(404, 'Project not found')
  }
  return project
}

export const getProjectAsMember = async (id: string, userId: string) => {
  const project = await getProjectOrThrow(id)
  await getWorkspaceAsMember(project.workspace.toString(), userId)
  return project
}

/** Ensures `projectId` belongs to `workspaceId`. Falls back to the workspace default project. */
export const resolveProjectForWorkspace = async (
  workspaceId: string,
  projectId?: string,
): Promise<IProject> => {
  if (projectId) {
    const project = await getProjectOrThrow(projectId)
    if (project.workspace.toString() !== workspaceId) {
      throw new HttpError(400, 'Project does not belong to this workspace')
    }
    return project
  }

  const fallback = await getDefaultWorkspaceProject(workspaceId)
  if (!fallback) {
    throw new HttpError(400, 'No project found for this workspace')
  }
  return fallback
}

export const parseCreateWorkspaceInput = (body: Record<string, unknown>) => {
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  if (!name) {
    throw new HttpError(400, 'Workspace name is required')
  }

  const defaults = defaultWorkspaceSettings()
  const settings = normalizeWorkspaceSettings(
    (body.settings as IWorkspace['settings'] | undefined) ?? defaults.settings,
  )

  const imageUrl =
    typeof body.logo === 'string'
      ? body.logo
      : typeof body.avatar === 'string'
        ? body.avatar
        : undefined

  return {
    name,
    description: body.description as string | undefined,
    avatar: imageUrl,
    logo: imageUrl,
    settings,
    usage: defaults.usage,
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

const optionalImageUrl = (value: unknown): string => {
  if (typeof value === 'string' && value.trim()) return value.trim()
  return ''
}

export const pickWorkspaceUpdates = (body: Record<string, unknown>): Partial<IWorkspace> => {
  const updates: Partial<IWorkspace> = {}

  if (typeof body.name === 'string' && body.name) {
    updates.name = body.name
  }
  if (body.description !== undefined) {
    updates.description = body.description as string | undefined
  }
  if (body.logo !== undefined || body.avatar !== undefined) {
    const imageUrl = optionalImageUrl(body.logo !== undefined ? body.logo : body.avatar)
    updates.logo = imageUrl
    updates.avatar = imageUrl
  }
  if (body.settings) {
    updates.settings = normalizeWorkspaceSettings(body.settings as IWorkspace['settings'])
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
