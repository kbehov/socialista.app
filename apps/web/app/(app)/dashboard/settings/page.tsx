import { GeneralSettings } from '@/components/settings/general-settings'
import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { isWorkspaceOwner } from '@/lib/workspace-role'
import { auth } from '@/auth'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'

export default async function SettingsGeneralPage() {
  const [session, workspace] = await Promise.all([auth(), getCurrentWorkspace()])

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to manage settings." />
  }

  return <GeneralSettings workspace={workspace} isOwner={isWorkspaceOwner(workspace, session?.user?.id)} />
}
