import { SlideshowList } from '@/components/carousel/slideshow-list'
import { getWorkspaceSlideshows } from '@/services/slideshow.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'
import { WorkspaceRequired } from '../../../../../components/dashboard/workspace-required'

export default async function SlideshowsPage() {
  const { workspace, project } = await getCurrentWorkspaceContext()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view slideshows." />
  }

  const response = await getWorkspaceSlideshows(workspace.id, 'draft', { projectId: project?.id })
  const slideshows = response.data?.slideshows ?? []
  const error = response.success ? null : (response.message ?? 'Failed to load slideshows')

  return (
    <SlideshowList
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      initialSlideshows={slideshows}
      initialError={error}
    />
  )
}
