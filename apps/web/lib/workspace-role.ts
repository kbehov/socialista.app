import type { WorkspaceResponse } from '@socialista/types'

export type WorkspaceRole = WorkspaceResponse['members'][number]['role']

export function getWorkspaceRole(
  workspace: Pick<WorkspaceResponse, 'members'> | null | undefined,
  userId: string | null | undefined,
): WorkspaceRole | null {
  if (!workspace || !userId) return null
  return workspace.members.find(member => member.id === userId)?.role ?? null
}

export function isWorkspaceAdmin(
  workspace: Pick<WorkspaceResponse, 'members'> | null | undefined,
  userId: string | null | undefined,
): boolean {
  const role = getWorkspaceRole(workspace, userId)
  return role === 'owner' || role === 'admin'
}

export function isWorkspaceOwner(
  workspace: Pick<WorkspaceResponse, 'members'> | null | undefined,
  userId: string | null | undefined,
): boolean {
  return getWorkspaceRole(workspace, userId) === 'owner'
}
