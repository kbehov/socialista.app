import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { SlideshowStudioWorkspace } from '@/components/studio/slideshows/slideshow-studio-workspace'
import { SLIDESHOW_LIST_PAGE_SIZE } from '@/constants/studio'
import { getModels } from '@/services/models.service'
import { getPresets } from '@/services/preset.service'
import { getWorkspaceSlideshows } from '@/services/slideshow.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'
import { ModelType, PresetKind } from '@socialista/types'
import { preload } from 'react-dom'

export default async function SlideshowsPage() {
  preload('/socialista-static-ads.webp', { as: 'image' })

  const contextPromise = getCurrentWorkspaceContext()
  const imageModelsPromise = getModels('limit=20&modelType=image&sort=-usageCount')
  const textModelsPromise = getModels(`limit=50&modelType=${ModelType.TEXT}&sort=-usageCount`)
  const presetsPromise = getPresets({
    kind: PresetKind.SLIDESHOW,
    active: true,
    limit: 20,
    sort: 'sortOrder',
  })
  const slideshowsPromise = contextPromise.then(({ workspace, project }) => {
    if (!workspace) return null
    return getWorkspaceSlideshows(workspace.id, {
      status: 'draft',
      page: 1,
      limit: SLIDESHOW_LIST_PAGE_SIZE,
      projectId: project?.id,
    })
  })

  const [{ workspace }, imageModelsRes, textModelsRes, presetsRes, slideshowsRes] = await Promise.all([
    contextPromise,
    imageModelsPromise,
    textModelsPromise,
    presetsPromise,
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
      presets={presetsRes.success ? (presetsRes.data?.presets ?? []) : []}
      workspaceId={workspace.id}
      initialSlideshows={slideshows}
      initialError={error}
      initialHasMore={Boolean(slideshowsRes?.meta?.hasNextPage)}
    />
  )
}
