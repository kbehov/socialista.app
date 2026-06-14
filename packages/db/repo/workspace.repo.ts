import { Types } from 'mongoose'
import { WorkspaceModel } from '../models/workspace.model.js'
import { IWorkspace, WorkspaceMemberRole } from '../types/workspace.types.js'
// Get workspace by id
export const getWorkspaceById = async (id: string) => {
  return await WorkspaceModel.findById(id).lean()
}

// Create workspace
export const createWorkspace = async (workspace: IWorkspace, userId: string) => {
  if (!userId) {
    throw new Error('User ID is required')
  }
  return await WorkspaceModel.create({
    ...workspace,
    ownerId: new Types.ObjectId(userId),
    members: [
      {
        userId: new Types.ObjectId(userId),
        role: WorkspaceMemberRole.OWNER,
      },
    ],
  })
}
// Add workspace member
export const addWorkspaceMember = async (workspaceId: string, userId: string, role: WorkspaceMemberRole) => {
  if (!workspaceId || !userId || !role) {
    throw new Error('Workspace ID, User ID and Role are required')
  }
  const workspace = await getWorkspaceById(workspaceId)
  if (!workspace) {
    throw new Error('Workspace not found')
  }
  if (workspace.members.some(member => member.userId.toString() === userId)) {
    throw new Error('User already a member of the workspace')
  }
  return await WorkspaceModel.findByIdAndUpdate(
    workspaceId,
    {
      $addToSet: { members: { userId: new Types.ObjectId(userId), role } },
    },
    { new: true },
  )
}

// Remove workspace member
export const removeWorkspaceMember = async (workspaceId: string, userId: string) => {
  if (!workspaceId || !userId) {
    throw new Error('Workspace ID and User ID are required')
  }
  const workspace = await getWorkspaceById(workspaceId)
  if (!workspace) {
    throw new Error('Workspace not found')
  }
  if (!workspace.members.some(member => member.userId.toString() === userId)) {
    throw new Error('User is not a member of the workspace')
  }
  return await WorkspaceModel.findByIdAndUpdate(
    workspaceId,
    { $pull: { members: { userId: new Types.ObjectId(userId) } } },
    { new: true },
  )
}

// Update workspace member role
export const updateWorkspaceMemberRole = async (workspaceId: string, userId: string, role: WorkspaceMemberRole) => {
  if (!workspaceId || !userId || !role) {
    throw new Error('Workspace ID, User ID and Role are required')
  }
  const workspace = await getWorkspaceById(workspaceId)
  if (!workspace) {
    throw new Error('Workspace not found')
  }
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
    { new: true },
  )
}

// Update workspace
export const updateWorkspace = async (workspaceId: string, workspace: Partial<IWorkspace>) => {
  if (!workspaceId || !workspace) {
    throw new Error('Workspace ID is required')
  }
  const wp = await getWorkspaceById(workspaceId)
  if (!wp) {
    throw new Error('Workspace not found')
  }
  return await WorkspaceModel.findByIdAndUpdate(workspaceId, { $set: { ...workspace } }, { new: true })
}
