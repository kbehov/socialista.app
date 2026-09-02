import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { SlideshowStudioWorkspace } from '@/components/studio/slideshows/slideshow-studio-workspace'
import { getModels } from '@/services/models.service'
import { getWorkspaceSlideshows } from '@/services/slideshow.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'
import { ModelType } from '@socialista/types'
import { preload } from 'react-dom'

export default async function SlideshowsPage() {
  preload('/socialista-static-ads.webp', { as: 'image' })

  const contextPromise = getCurrentWorkspaceContext()
  const imageModelsPromise = getModels('limit=20&modelType=image&sort=-usageCount')
  const textModelsPromise = getModels(`limit=50&modelType=${ModelType.TEXT}&sort=-usageCount`)
  const slideshowsPromise = contextPromise.then(({ workspace, project }) => {
    if (!workspace) return null
    return getWorkspaceSlideshows(workspace.id, 'draft', { projectId: project?.id })
  })

  const [{ workspace }, imageModelsRes, textModelsRes, slideshowsRes] = await Promise.all([
    contextPromise,
    imageModelsPromise,
    textModelsPromise,
    slideshowsPromise,
  ])

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to view slideshows." />
  }

  const slideshows = slideshowsRes?.data?.slideshows ?? []
  const error = slideshowsRes?.success ? null : (slideshowsRes?.message ?? 'Failed to load slideshows')
  const models = imageModelsRes.success ? (imageModelsRes.data?.models ?? []) : []
  const textModels = textModelsRes.success ? (textModelsRes.data?.models ?? []) : []

  return (
    <SlideshowStudioWorkspace
      models={models}
      textModels={textModels}
      workspaceId={workspace.id}
      initialSlideshows={slideshows}
      initialError={error}
    />
  )
}
