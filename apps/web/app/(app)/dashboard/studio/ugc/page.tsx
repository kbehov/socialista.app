import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { UgcProjectList } from '@/components/studio/ugc/ugc-project-list'
import { getWorkspaceUgcProjects } from '@/services/ugc-project.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'

export default async function UgcProjectsPage() {
  const { workspace, project } = await getCurrentWorkspaceContext()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view UGC ads." />
  }

  const response = await getWorkspaceUgcProjects(workspace.id, { projectId: project?.id })
  const projects = response.data?.projects ?? []
  const error = response.success ? null : (response.message ?? 'Failed to load UGC ads')

  return (
    <UgcProjectList
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      initialProjects={projects}
      initialError={error}
    />
  )
}
