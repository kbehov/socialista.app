import { ImageStudioWorkspace } from '@/components/studio/images/image-studio-workspace'
import { getWorkspaceGenerations } from '@/services/generation.service'
import { getModels } from '@/services/models.service'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'
import { preload } from 'react-dom'

const ImagesPage = async () => {
  preload('/socialista-image.webp', { as: 'image' })

  const modelsPromise = getModels('limit=20&modelType=image&sort=-usageCount')
  const generationsPromise = getCurrentWorkspaceContext().then(({ workspace, project }) => {
    if (!workspace) return null
    return getWorkspaceGenerations(workspace.id, {
      kind: 'image',
      status: 'completed',
      limit: 12,
      sort: '-createdAt',
      projectId: project?.id,
    })
  })

  const [{ data, success }, generationsRes] = await Promise.all([
    modelsPromise,
    generationsPromise,
  ])

  if (!success) {
    throw new Error('Failed to load models')
  }

  return (
    <ImageStudioWorkspace
      models={data?.models ?? []}
      recentGenerations={generationsRes?.data?.generations ?? []}
    />
  )
}

export default ImagesPage
