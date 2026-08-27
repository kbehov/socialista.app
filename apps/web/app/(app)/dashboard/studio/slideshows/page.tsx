import { SlideshowList } from '@/components/carousel/slideshow-list'
import { SlideshowPromptComposer } from '@/components/carousel/slideshow-prompt-composer'
import { getModels } from '@/services/models.service'
import { getWorkspaceSlideshows } from '@/services/slideshow.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'
import { WorkspaceRequired } from '../../../../../components/dashboard/workspace-required'

export default async function SlideshowsPage() {
  const [{ workspace, project }, modelsRes] = await Promise.all([
    getCurrentWorkspaceContext(),
    getModels('limit=20&modelType=text-to-image&sort=-usageCount'),
  ])

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view slideshows." />
  }

  const response = await getWorkspaceSlideshows(workspace.id, 'draft', { projectId: project?.id })
  const slideshows = response.data?.slideshows ?? []
  const error = response.success ? null : (response.message ?? 'Failed to load slideshows')
  const models = modelsRes.success ? (modelsRes.data?.models ?? []) : []

  return (
    <SlideshowList
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      initialSlideshows={slideshows}
      initialError={error}
      composer={<SlideshowPromptComposer models={models} />}
    />
  )
}
