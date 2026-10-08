import { CreateSkillFallback } from '@/components/skills/create-skill-fallback'
import { WorkspaceSkillForm } from '@/components/skills/workspace-skill-form'
import { createDashboardMetadata } from '@/lib/seo/dashboard-metadata'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'

export const metadata = createDashboardMetadata('Create skill')

export default async function CreateWorkspaceSkillPage() {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return (
      <CreateSkillFallback
        title="Select a workspace"
        description="Choose a workspace before creating skills."
      />
    )
  }

  return <WorkspaceSkillForm workspaceId={workspace.id} />
}
