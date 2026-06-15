import { assertHasUpdates, parseParamId, type AuthContext } from '@/utils/common.utils.js'
import { successResponse } from '@/utils/http-response.js'
import { getUserOrThrow } from '@/utils/user.utils.js'
import {
  assertModifiableMember,
  defaultWorkspaceBilling,
  getWorkspaceAsAdmin,
  getWorkspaceAsMember,
  getWorkspaceAsOwner,
  loadWorkspaceMembers,
  parseAddMemberInput,
  parseCreateWorkspaceInput,
  parseMemberRoleUpdate,
  pickWorkspaceUpdates,
  serializeWorkspace,
} from '@/utils/workspace.utils.js'
import {
  addWorkspaceMember as addWorkspaceMemberRecord,
  createWorkspace as createWorkspaceRecord,
  deleteWorkspace as deleteWorkspaceRecord,
  getUserWorkspaces as getUserWorkspacesFromDb,
  removeWorkspaceMember as removeWorkspaceMemberRecord,
  updateWorkspace as updateWorkspaceRecord,
  updateWorkspaceMemberRole,
} from '@socialista/db'

export const getUserWorkspaces = async (c: AuthContext) => {
  const workspaces = await getUserWorkspacesFromDb(c.get('userId'))
  return successResponse(c, 200, {
    workspaces: workspaces.map(workspace => serializeWorkspace(workspace)),
  })
}

export const createWorkspace = async (c: AuthContext) => {
  const input = parseCreateWorkspaceInput(await c.req.json())
  const workspace = await createWorkspaceRecord(
    { ...input, billing: defaultWorkspaceBilling() },
    c.get('userId'),
  )

  return successResponse(c, 201, { workspace: serializeWorkspace(workspace) })
}

export const getWorkspace = async (c: AuthContext) => {
  const workspace = await getWorkspaceAsMember(
    parseParamId(c.req.param('id'), 'workspace ID'),
    c.get('userId'),
  )
  return successResponse(c, 200, { workspace: serializeWorkspace(workspace) })
}

export const updateWorkspace = async (c: AuthContext) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'workspace ID')

  await getWorkspaceAsAdmin(id, userId)

  const updates = pickWorkspaceUpdates(await c.req.json())
  assertHasUpdates(updates)

  const updated = await updateWorkspaceRecord(id, updates)
  return successResponse(c, 200, { workspace: serializeWorkspace(updated!) })
}

export const deleteWorkspace = async (c: AuthContext) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'workspace ID')

  await getWorkspaceAsOwner(id, userId)
  await deleteWorkspaceRecord(id)

  return successResponse(c, 200, { message: 'Workspace deleted successfully' })
}

export const getWorkspaceMembers = async (c: AuthContext) => {
  const workspace = await getWorkspaceAsMember(
    parseParamId(c.req.param('id'), 'workspace ID'),
    c.get('userId'),
  )

  const members = await loadWorkspaceMembers(workspace)
  return successResponse(c, 200, { members })
}

export const addWorkspaceMember = async (c: AuthContext) => {
  const userId = c.get('userId')
  const id = parseParamId(c.req.param('id'), 'workspace ID')

  await getWorkspaceAsAdmin(id, userId)

  const { memberId, role } = parseAddMemberInput(await c.req.json())
  await getUserOrThrow(memberId)

  const updated = await addWorkspaceMemberRecord(id, memberId, role)
  return successResponse(c, 201, { workspace: serializeWorkspace(updated!) })
}

export const updateWorkspaceMember = async (c: AuthContext) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('id'), 'workspace ID')
  const memberId = parseParamId(c.req.param('userId'), 'user ID')
  const workspace = await getWorkspaceAsAdmin(workspaceId, userId)

  assertModifiableMember(workspace, memberId)

  const role = parseMemberRoleUpdate(await c.req.json())
  const updated = await updateWorkspaceMemberRole(workspaceId, memberId, role)

  return successResponse(c, 200, { workspace: serializeWorkspace(updated!) })
}

export const removeWorkspaceMember = async (c: AuthContext) => {
  const userId = c.get('userId')
  const workspaceId = parseParamId(c.req.param('id'), 'workspace ID')
  const memberId = parseParamId(c.req.param('userId'), 'user ID')
  const workspace = await getWorkspaceAsAdmin(workspaceId, userId)

  assertModifiableMember(workspace, memberId)

  const updated = await removeWorkspaceMemberRecord(workspaceId, memberId)
  return successResponse(c, 200, { workspace: serializeWorkspace(updated!) })
}
