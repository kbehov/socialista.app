import { MembersSettings } from '@/components/settings/members-settings'
import { ErrorState } from '@/components/common/error-state'
import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { getWorkspaceInvitations } from '@/services/invitation.service'
import { getWorkspaceMembers } from '@/services/workspace.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'

export default async function SettingsMembersPage() {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to manage members." />
  }

  const [membersResponse, invitationsResponse] = await Promise.all([
    getWorkspaceMembers(workspace.id),
    getWorkspaceInvitations(workspace.id, { status: 'pending' }),
  ])

  if (!membersResponse.success) {
    return (
      <ErrorState
        title={membersResponse.message ?? 'Failed to load members'}
        description="Refresh the page to try again."
      />
    )
  }

  return (
    <MembersSettings
      workspace={workspace}
      members={membersResponse.data?.members ?? []}
      invitations={invitationsResponse.data?.invitations ?? []}
    />
  )
}
