import { WorkspaceRequired } from '../../_components/workspace-required'
import { SlideshowList } from '@/components/carousel/slideshow-list'
import { getWorkspaceSlideshows } from '@/services/slideshow.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'

export default async function SlideshowsPage() {
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view slideshows." />
  }

  const response = await getWorkspaceSlideshows(workspace.id, 'draft')
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
