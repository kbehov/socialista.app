import { ErrorState } from '@/components/common/error-state'
import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { DASHBOARD_ROUTES } from '@/constants/app-routes'
import { createUgcProject } from '@/services/ugc-project.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CreateUgcProjectPage() {
  const { workspace, project } = await getCurrentWorkspaceContext()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to create a UGC ad." />
  }

  const response = await createUgcProject({ workspaceId: workspace.id, projectId: project?.id })
  if (!response.success || !response.data?.project) {
    return (
      <ErrorState
        title={response.message ?? 'Could not create a UGC ad'}
        description="Try again from the UGC ads list."
      />
    )
  }

  redirect(DASHBOARD_ROUTES.STUDIO.ugcProject(response.data.project.id))
}
