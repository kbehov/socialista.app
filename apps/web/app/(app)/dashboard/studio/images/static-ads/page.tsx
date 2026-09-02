import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { StaticAdStudioWorkspace } from '@/components/studio/static-ads/static-ad-studio-workspace'
import { getModels } from '@/services/models.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { ContextSupport } from '@socialista/types'
import { preload } from 'react-dom'

const STATIC_AD_MODELS_QUERY =
  'limit=50&modelType=image&contextSupports=image&sort=-usageCount'

const StaticAdsPage = async () => {
  preload('/socialista-static-ads.webp', { as: 'image' })

  const [workspace, modelsRes] = await Promise.all([
    getCurrentWorkspace(),
    getModels(STATIC_AD_MODELS_QUERY),
  ])

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to create static ads." />
  }

  const models = (modelsRes.success ? (modelsRes.data?.models ?? []) : []).filter(model =>
    model.contextSupports?.includes(ContextSupport.IMAGE),
  )

  return <StaticAdStudioWorkspace models={models} workspaceId={workspace.id} />
}

export default StaticAdsPage
