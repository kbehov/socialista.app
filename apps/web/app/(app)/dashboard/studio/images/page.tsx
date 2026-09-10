import { ImageStudioWorkspace } from '@/components/studio/images/image-studio-workspace'
import { getWorkspaceGenerations } from '@/services/generation.service'
import { getModels } from '@/services/models.service'
import { getPresets } from '@/services/preset.service'
import { PresetKind } from '@socialista/types'
import { getCurrentWorkspaceContext } from '@/utils/project.utils.server'
import { preload } from 'react-dom'

const ImagesPage = async () => {
  preload('/socialista-image.webp', { as: 'image' })

  const modelsPromise = getModels('limit=20&modelType=image&sort=-usageCount')
  const presetsPromise = getPresets({
    kind: PresetKind.IMAGE,
    active: true,
    limit: 20,
    sort: 'sortOrder',
  })
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

  const [{ data, success }, presetsRes, generationsRes] = await Promise.all([
    modelsPromise,
    presetsPromise,
    generationsPromise,
  ])

  if (!success) {
    throw new Error('Failed to load models')
  }

  return (
    <ImageStudioWorkspace
      models={data?.models ?? []}
      presets={presetsRes.success ? (presetsRes.data?.presets ?? []) : []}
      recentGenerations={generationsRes?.data?.generations ?? []}
    />
  )
}

export default ImagesPage
