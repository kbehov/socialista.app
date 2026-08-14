import { WorkspaceRequired } from '@/components/dashboard/workspace-required'
import { StaticAdStudioWorkspace } from '@/components/studio/static-ads/static-ad-studio-workspace'
import { getModels } from '@/services/models.service'
import { getCurrentWorkspace } from '@/utils/workspace.utils.server'
import { STATIC_AD_MODEL } from '@socialista/types'
import { preload } from 'react-dom'

const StaticAdsPage = async () => {
  preload('/socialista-static-ads.webp', { as: 'image' })
  const workspace = await getCurrentWorkspace()

  if (!workspace) {
    return <WorkspaceRequired message="Select a workspace to create static ads." />
  }

  const modelsRes = await getModels(
    `limit=1&modelType=text-to-image&value=${encodeURIComponent(STATIC_AD_MODEL)}`,
  )
  const model = modelsRes.success ? (modelsRes.data?.models[0] ?? null) : null

  return <StaticAdStudioWorkspace model={model} workspaceId={workspace.id} />
}

export default StaticAdsPage
